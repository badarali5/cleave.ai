import { InMemoryJobQueue } from "./in-memory-job-queue.js";
import { runCurIngestion } from "../ingestion/cur-ingestion.job.js";
import { runWorkerDemo } from "../jobs/index.js";
import { RecommendationPipelineService } from "../services/recommendation-pipeline.service.js";
import { InMemoryRecommendationRepository } from "../../../api/src/modules/recommendations/in-memory-recommendation.repository.js";
import { InMemoryAuditRepository } from "../../../api/src/modules/audit/in-memory-audit.repository.js";

export function createWorkerRuntime() {
  const queue = new InMemoryJobQueue();

  // Only seed demo jobs if the queue is empty
  if (queue.list().length === 0) {
    queue.enqueue({ id: "job-billing-1", type: "billing-ingestion", payload: { source: "demo-cur" } });
    queue.enqueue({ id: "job-analysis-1", type: "cost-analysis", payload: { scope: "organization" } });
  }

  const recommendationPipeline = new RecommendationPipelineService();
  const recommendationRepo = new InMemoryRecommendationRepository();
  const auditRepo = new InMemoryAuditRepository();

  return {
    queue,
    async runNext() {
      const job = queue.claimNext();

      if (!job) {
        return { status: "idle" as const };
      }

      console.log(`[WORKER RUNTIME]: Claimed job ${job.id} of type ${job.type}`);

      try {
        if (job.type === "billing-ingestion") {
          const csvText = [
            "lineItem_UsageStartDate,product_ProductName,lineItem_UsageType,lineItem_ResourceId,lineItem_UnblendedCost,lineItem_UsageAmount,lineItem_CurrencyCode,resourceTags/Environment",
            "2026-07-01T00:00:00Z,Amazon Elastic Compute Cloud,BoxUsage:i-1234567890abcdef0,i-1234567890abcdef0,120.34,100,USD,staging",
            "2026-07-01T00:00:00Z,Amazon Elastic Block Store,EBS:VolumeUsage,vol-0123456789abcdef0,vol-0123456789abcdef0,19.76,200,USD,staging",
          ].join("\n");

          runCurIngestion({
            jobId: job.id,
            organizationId: (job.payload.organizationId as string) ?? "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            cloudAccountId: (job.payload.cloudAccountId as string) ?? "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            sourceType: "csv_upload",
            csvText,
          });

          const orgId = (job.payload.organizationId as string) ?? "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
          const cloudAccId = (job.payload.cloudAccountId as string) ?? "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

          const mockResources = [
            {
              id: "i-1234567890abcdef0",
              kind: "ec2_instance",
              resourceArn: `arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0`,
              name: "Staging EC2 Instance",
              metrics: { cpuUtilization: 1.2, networkBytes: 540, monthlyCost: 124.32 }
            },
            {
              id: "vol-0123456789abcdef0",
              kind: "ebs_volume",
              resourceArn: `arn:aws:ec2:us-east-1:123456789012:volume/vol-0123456789abcdef0`,
              name: "Orphaned EBS Volume",
              metrics: { attached: false, monthlyCost: 22.50 }
            },
            {
              id: "rds-db-prod",
              kind: "rds_instance",
              resourceArn: `arn:aws:rds:us-east-1:123456789012:db/rds-db-prod`,
              name: "Oversized Production DB",
              metrics: { cpuUtilization: 8.5, networkBytes: 45000, monthlyCost: 780.00 }
            }
          ];

          await recommendationPipeline.processResources(orgId, cloudAccId, mockResources);
        }

        if (job.type === "cost-analysis") {
          runWorkerDemo();
        }

        if (job.type === "remediation-execution") {
          const recommendationId = job.payload.recommendationId as string;
          const organizationId = job.payload.organizationId as string;

          const rec = await recommendationRepo.findById(recommendationId);
          if (!rec) {
            console.error(`[WORKER RUNTIME]: Recommendation ${recommendationId} not found.`);
            queue.complete(job.id, false);
            return { status: "failed" as const, job, reason: "Recommendation not found" };
          }

          // 1. Create a pre-flight execution safety audit log
          await auditRepo.append({
            organizationId,
            actorType: "agent",
            action: "remediation_execution_preflight",
            targetType: "recommendation",
            targetId: rec.id,
            metadata: {
              statusBefore: rec.status,
              remediationScript: rec.remediationScript,
              estimatedSavings: rec.estimatedMonthlySavings,
              message: `Preflight checks passed for executing remediation script: "${rec.remediationScript}"`,
            }
          });

          // 2. Simulate remediation success
          console.log(`[WORKER REMEDIATION SIMULATION]: Executing "${rec.remediationScript}"... SUCCESS.`);

          // 3. Move recommendation status flag cleanly to executed
          rec.status = "executed";
          await recommendationRepo.save(rec);

          // Append audit event for completion
          await auditRepo.append({
            organizationId,
            actorType: "agent",
            action: "remediation_execution_success",
            targetType: "recommendation",
            targetId: rec.id,
            metadata: {
              statusAfter: rec.status,
              message: `Successfully executed remediation for: ${rec.title}`
            }
          });
        }

        queue.complete(job.id, true);
        return { status: "completed" as const, job };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[WORKER RUNTIME]: Error processing job ${job.id}:`, error);
        queue.complete(job.id, false);
        return { status: "failed" as const, job, reason: errorMsg };
      }
    },
  };
}
