import type { InMemoryBillingIngestionRepository } from "./in-memory-billing-ingestion.repository.js";
import type { CurIngestionSummary } from "./billing-ingestion.types.js";

export class BillingIngestionService {
  constructor(private readonly repository: InMemoryBillingIngestionRepository) {}

  createCurJob(input: {
    organizationId: string;
    cloudAccountId: string;
    bucketName?: string;
    bucketPrefix?: string;
    reportName?: string;
    sourceType?: "s3_manifest" | "csv_upload";
  }) {
    const jobRequest = {
      organizationId: input.organizationId,
      cloudAccountId: input.cloudAccountId,
      sourceType: input.sourceType ?? "s3_manifest",
      ...(input.bucketName ? { bucketName: input.bucketName } : {}),
      ...(input.bucketPrefix ? { bucketPrefix: input.bucketPrefix } : {}),
      ...(input.reportName ? { reportName: input.reportName } : {}),
    };

    return this.repository.createJob(jobRequest);
  }

  listCurJobs(organizationId: string) {
    return this.repository.listJobs(organizationId);
  }

  markJobRunning(jobId: string) {
    return this.repository.markRunning(jobId);
  }

  markJobSucceeded(jobId: string, summary: {
    jobId: string;
    organizationId: string;
    cloudAccountId: string;
    sourceType: "s3_manifest" | "csv_upload";
    lineItemsParsed: number;
    totalCost: number;
    services: string[];
  }) {
    const completedSummary: Omit<CurIngestionSummary, "completedAt"> = {
      jobId: summary.jobId,
      organizationId: summary.organizationId,
      cloudAccountId: summary.cloudAccountId,
      sourceType: summary.sourceType,
      lineItemsParsed: summary.lineItemsParsed,
      totalCost: summary.totalCost,
      services: summary.services,
    };

    return this.repository.markSucceeded(jobId, completedSummary);
  }

  listSummaries(organizationId: string) {
    return this.repository.listSummaries(organizationId);
  }
}
