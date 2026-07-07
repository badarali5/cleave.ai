import { randomUUID } from "node:crypto";
import type { Report } from "./report.types.js";

export class InMemoryReportRepository {
  private readonly reports: Report[] = [
    {
      id: randomUUID(),
      organizationId: "00000000-0000-0000-0000-000000000000",
      reportType: "weekly",
      title: "Weekly savings report",
      summary: "3 approved remediations generated estimated savings of $1,245 last week.",
      fileUrl: "https://example.com/report.pdf",
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  async list(organizationId: string) {
    return this.reports.filter((report) => report.organizationId === organizationId);
  }
}
