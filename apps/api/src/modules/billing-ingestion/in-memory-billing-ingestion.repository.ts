import { randomUUID } from "node:crypto";
import type { CurIngestionJob, CurIngestionSummary } from "./billing-ingestion.types.js";

export class InMemoryBillingIngestionRepository {
  private readonly jobs: CurIngestionJob[] = [];
  private readonly summaries: CurIngestionSummary[] = [];

  async createJob(input: Omit<CurIngestionJob, "id" | "createdAt" | "status">) {
    const job: CurIngestionJob = {
      ...input,
      id: randomUUID(),
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    this.jobs.push(job);
    return job;
  }

  async listJobs(organizationId: string) {
    return this.jobs.filter((job) => job.organizationId === organizationId);
  }

  async findJob(id: string) {
    return this.jobs.find((job) => job.id === id);
  }

  async markRunning(id: string) {
    const job = await this.findJob(id);
    if (!job) {
      return undefined;
    }
    job.status = "running";
    return job;
  }

  async markSucceeded(jobId: string, summary: Omit<CurIngestionSummary, "completedAt">) {
    const job = await this.findJob(jobId);
    if (!job) {
      return undefined;
    }

    job.status = "succeeded";
    const completed: CurIngestionSummary = {
      ...summary,
      completedAt: new Date().toISOString(),
    };

    this.summaries.push(completed);
    return completed;
  }

  async listSummaries(organizationId: string) {
    return this.summaries.filter((summary) => summary.organizationId === organizationId);
  }
}
