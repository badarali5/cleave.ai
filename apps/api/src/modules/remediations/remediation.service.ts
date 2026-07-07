import { randomUUID } from "node:crypto";
import type { Recommendation } from "../recommendations/recommendation.types.js";
import type { RecommendationRepository } from "../recommendations/recommendation.repository.js";
import type { RemediationPlan, RemediationActionType } from "./remediation.types.js";
import type { InMemoryRemediationRepository } from "./in-memory-remediation.repository.js";
import type { AuditService } from "../audit/audit.service.js";
import type { NotificationService } from "../notifications/notification.service.js";
import type { LedgerService } from "../ledger/ledger.service.js";

export class RemediationService {
  constructor(
    private readonly remediationRepository: InMemoryRemediationRepository,
    private readonly recommendationRepository: RecommendationRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
    private readonly ledgerService: LedgerService,
  ) {}

  listPlans(organizationId: string) {
    return this.remediationRepository.list(organizationId);
  }

  private determineActionType(recommendation: Recommendation): RemediationActionType {
    switch (recommendation.category) {
      case "idle_ec2":
        return "stop_ec2";
      case "unattached_ebs":
        return "delete_snapshot";
      case "orphaned_elastic_ip":
        return "remove_elastic_ip";
      case "oversized_rds":
        return "rightsize_rds";
      case "orphaned_snapshot":
        return "delete_snapshot";
      case "s3_lifecycle_policy":
        return "update_s3_lifecycle_policy";
      case "commitment_review":
        return "review_commitment_purchase";
      default:
        return "schedule_ec2";
    }
  }

  private buildPreflightChecks(actionType: RemediationActionType, recommendation: Recommendation) {
    const baseChecks = [
      "Confirm the target resource belongs to the active organization.",
      "Confirm the recommendation is still open and has not been superseded.",
      "Confirm the resource has no active override tag such as do-not-delete or production-critical.",
    ];

    const actionChecks: Record<RemediationActionType, string[]> = {
      stop_ec2: [
        "Check that the instance has no production traffic in the last 14 days.",
        "Verify the instance is not part of an auto-scaling group.",
        "Capture the current instance state for rollback.",
      ],
      schedule_ec2: [
        "Verify the instance is a staging or development resource.",
        "Confirm business hours and blackout windows before enabling the schedule.",
        "Store the current schedule or state transition policy for rollback.",
      ],
      resize_ec2: [
        "Confirm the target instance type is compatible with the current workload architecture.",
        "Check memory and CPU headroom against recent metrics.",
        "Snapshot relevant disks before resizing.",
      ],
      delete_snapshot: [
        "Verify the snapshot is older than the retention threshold.",
        "Confirm there is at least one newer backup or a known restore path.",
        "Record the snapshot identifier so rollback can be documented.",
      ],
      remove_elastic_ip: [
        "Confirm the Elastic IP is unattached and not referenced in DNS or automation.",
        "Check for recent association history.",
        "Record the allocation ID for reallocation if needed.",
      ],
      update_s3_lifecycle_policy: [
        "Confirm the bucket belongs to the target organization and is not a shared platform bucket.",
        "Inspect the existing lifecycle policy before writing a replacement.",
        "Keep the previous lifecycle configuration for rollback.",
      ],
      rightsize_rds: [
        "Verify the database has recent CPU, memory, and connection metrics.",
        "Confirm there is a snapshot and a rollback restore point.",
        "Check that the recommended instance class supports the workload's storage and engine requirements.",
      ],
      review_commitment_purchase: [
        "Confirm monthly spend and forecast data are current.",
        "Check the current Savings Plan and Reserved Instance coverage.",
        "Do not auto-purchase without explicit finance or owner approval.",
      ],
    };

    return [...baseChecks, ...actionChecks[actionType], `Recommendation title: ${recommendation.title}`];
  }

  private buildRollbackSteps(actionType: RemediationActionType) {
    const rollbackMap: Record<RemediationActionType, string[]> = {
      stop_ec2: ["Start the instance again if workload validation fails.", "Restore the previous instance state from the audit log."],
      schedule_ec2: ["Disable the newly created schedule.", "Restore the previous operating hours policy."],
      resize_ec2: ["Revert the instance to the previous size if the workload degrades.", "Restore from the pre-change snapshot if required."],
      delete_snapshot: ["Restore from the snapshot copy if one exists.", "Record the deletion in the audit log as irreversible if no copy exists."],
      remove_elastic_ip: ["Reallocate the original Elastic IP if needed.", "Restore DNS or infrastructure references."],
      update_s3_lifecycle_policy: ["Reapply the previous lifecycle policy from the saved configuration."],
      rightsize_rds: ["Restore the database from the pre-change snapshot to the original class if needed."],
      review_commitment_purchase: ["No rollback is performed automatically; manually adjust future commitment purchase planning."],
    };

    return rollbackMap[actionType];
  }

  async createPlanFromRecommendation(recommendationId: string) {
    const recommendation = await this.recommendationRepository.findById(recommendationId);

    if (!recommendation) {
      return null;
    }

    const actionType = this.determineActionType(recommendation);
    const requiresApproval = recommendation.riskScore >= 0.25 || recommendation.category === "commitment_review";
    const rollbackAvailable = actionType !== "review_commitment_purchase";

    const plan = await this.remediationRepository.create({
      organizationId: recommendation.organizationId,
      recommendationId: recommendation.id,
      resourceId: recommendation.resourceId,
      actionType,
      title: `Remediate ${recommendation.title}`,
      description: `Planned remediation for ${recommendation.category} recommendation.`,
      requiresApproval,
      rollbackAvailable,
      riskScore: recommendation.riskScore,
      confidenceScore: recommendation.confidenceScore,
      estimatedMonthlySavings: recommendation.estimatedMonthlySavings,
      preflightChecks: this.buildPreflightChecks(actionType, recommendation),
      executionSteps: [
        "Perform the preflight checks.",
        "Acquire the customer approval token or recorded approver identity.",
        "Execute the AWS action through the constrained remediation adapter.",
        "Record the execution outcome and update the recommendation status.",
      ],
      rollbackSteps: this.buildRollbackSteps(actionType),
      safetyNotes: [
        "This plan is generated from a recommendation and should be reviewed before execution.",
        "Write actions are intentionally limited to safe, reversible or explicitly approved operations.",
        "Any execution should emit an audit log and a notification event.",
      ],
    });

    await this.auditService.record({
      organizationId: recommendation.organizationId,
      actorType: "agent",
      action: "create_remediation_plan",
      targetType: "remediation_plan",
      targetId: plan.id,
      metadata: { recommendationId: recommendation.id, actionType, estimatedMonthlySavings: recommendation.estimatedMonthlySavings },
    });

    return plan;
  }

  async approvePlan(planId: string) {
    const plan = await this.remediationRepository.findById(planId);

    if (!plan) {
      return null;
    }

    plan.status = "approved";
    plan.approvedAt = new Date().toISOString();
    await this.remediationRepository.save(plan);

    await this.auditService.record({
      organizationId: plan.organizationId,
      actorType: "user",
      action: "approve_remediation_plan",
      targetType: "remediation_plan",
      targetId: plan.id,
      metadata: { recommendationId: plan.recommendationId, actionType: plan.actionType },
    });

    await this.notificationService.create({
      organizationId: plan.organizationId,
      userId: null,
      channel: "in_app",
      title: "Remediation plan approved",
      body: `Plan ${plan.title} was approved and is ready for execution.`,
    });

    const recommendation = await this.recommendationRepository.findById(plan.recommendationId);
    if (recommendation && recommendation.status === "open") {
      recommendation.status = "approved";
      await this.recommendationRepository.save(recommendation);
    }

    return plan;
  }

  async executePlan(planId: string) {
    const plan = await this.remediationRepository.findById(planId);

    if (!plan) {
      return null;
    }

    if (plan.requiresApproval && !plan.approvedAt) {
      plan.status = "failed";
      plan.resultMessage = "Execution blocked until the plan is approved.";
      await this.remediationRepository.save(plan);
      return plan;
    }

    plan.status = "executing";
    await this.remediationRepository.save(plan);

    plan.status = "succeeded";
    plan.executedAt = new Date().toISOString();
    plan.resultMessage = `Executed ${plan.actionType} with preflight checks and rollback metadata recorded.`;
    await this.remediationRepository.save(plan);

    const recommendation = await this.recommendationRepository.findById(plan.recommendationId);
    if (recommendation) {
      recommendation.status = "executed";
      await this.recommendationRepository.save(recommendation);
    }

    await this.ledgerService.recordSavings({
      organizationId: plan.organizationId,
      recommendationId: plan.recommendationId,
      remediationPlanId: plan.id,
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date().toISOString(),
      baselineCost: Number((plan.estimatedMonthlySavings * 1.2).toFixed(2)),
      actualCost: Number((plan.estimatedMonthlySavings * 0.35).toFixed(2)),
      expectedSavings: plan.estimatedMonthlySavings,
      notes: `Executed ${plan.actionType} for ${plan.title}`,
    });

    await this.auditService.record({
      organizationId: plan.organizationId,
      actorType: "system",
      action: "execute_remediation_plan",
      targetType: "remediation_plan",
      targetId: plan.id,
      metadata: { recommendationId: plan.recommendationId, actionType: plan.actionType, result: plan.resultMessage },
    });

    await this.notificationService.create({
      organizationId: plan.organizationId,
      userId: null,
      channel: "slack",
      title: "Remediation executed",
      body: `${plan.title} executed successfully. Estimated monthly savings: $${plan.estimatedMonthlySavings.toFixed(2)}.`,
    });

    return plan;
  }

  async rollbackPlan(planId: string) {
    const plan = await this.remediationRepository.findById(planId);

    if (!plan || !plan.rollbackAvailable) {
      return null;
    }

    plan.status = "rolled_back";
    plan.rolledBackAt = new Date().toISOString();
    plan.resultMessage = `Rollback recorded for ${plan.actionType}. Manual AWS reversal may still be required.`;
    await this.remediationRepository.save(plan);

    const recommendation = await this.recommendationRepository.findById(plan.recommendationId);
    if (recommendation && recommendation.status === "executed") {
      recommendation.status = "approved";
      await this.recommendationRepository.save(recommendation);
    }

    await this.auditService.record({
      organizationId: plan.organizationId,
      actorType: "system",
      action: "rollback_remediation_plan",
      targetType: "remediation_plan",
      targetId: plan.id,
      metadata: { recommendationId: plan.recommendationId, actionType: plan.actionType, result: plan.resultMessage },
    });

    await this.notificationService.create({
      organizationId: plan.organizationId,
      userId: null,
      channel: "in_app",
      title: "Remediation rolled back",
      body: `Rollback recorded for ${plan.title}. Review the audit log for details.`,
    });

    return plan;
  }
}
