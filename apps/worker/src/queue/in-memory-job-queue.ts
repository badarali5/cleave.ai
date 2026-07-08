import { readDbFile, writeDbFile } from "@finops/domain";

export type WorkerJob = {
  id: string;
  type: "billing-ingestion" | "resource-sync" | "cost-analysis" | "report-generation" | "remediation-execution";
  payload: Record<string, unknown>;
  enqueuedAt: string;
  status: "queued" | "running" | "succeeded" | "failed";
};

export class InMemoryJobQueue {
  private get jobs(): WorkerJob[] {
    return readDbFile<WorkerJob[]>("jobs.json", []);
  }

  private set jobs(value: WorkerJob[]) {
    writeDbFile("jobs.json", value);
  }

  enqueue(job: Omit<WorkerJob, "status" | "enqueuedAt">) {
    const currentJobs = this.jobs;
    const record: WorkerJob = {
      ...job,
      status: "queued",
      enqueuedAt: new Date().toISOString(),
    };

    currentJobs.push(record);
    this.jobs = currentJobs;
    return record;
  }

  claimNext() {
    const currentJobs = this.jobs;
    const job = currentJobs.find((item) => item.status === "queued");

    if (!job) {
      return null;
    }

    job.status = "running";
    this.jobs = currentJobs;
    return job;
  }

  complete(jobId: string, succeeded: boolean) {
    const currentJobs = this.jobs;
    const job = currentJobs.find((item) => item.id === jobId);

    if (!job) {
      return null;
    }

    job.status = succeeded ? "succeeded" : "failed";
    this.jobs = currentJobs;
    return job;
  }

  list() {
    return this.jobs;
  }
}
