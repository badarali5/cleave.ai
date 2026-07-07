import type { InMemoryReportRepository } from "./in-memory-report.repository.js";

export class ReportService {
  constructor(private readonly repository: InMemoryReportRepository) {}

  list(organizationId: string) {
    return this.repository.list(organizationId);
  }
}
