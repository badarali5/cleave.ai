import type { FastifyPluginAsync } from "fastify";
import { InMemoryReportRepository } from "./in-memory-report.repository.js";
import { ReportService } from "./report.service.js";

const service = new ReportService(new InMemoryReportRepository());

export const reportRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.list("00000000-0000-0000-0000-000000000000") }));
};
