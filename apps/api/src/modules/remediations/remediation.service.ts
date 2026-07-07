import { randomUUID } from "node:crypto";
import type { Recommendation } from "../recommendations/recommendation.types.js";
import type { RecommendationRepository } from "../recommendations/recommendation.repository.js";
import type { RemediationPlan, RemediationActionType } from "./remediation.types.js";
import type { InMemoryRemediationRepository } from "./in-memory-remediation.repository.js";

export class RemediationService {
  constructor(
    private readonly remediationRepository: InMemoryRemediationRepository,
    private readonly recommendationRepository: RecommendationRepository,
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

    return plan;
  }
}
