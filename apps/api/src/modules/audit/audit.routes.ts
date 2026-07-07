import type { FastifyPluginAsync } from "fastify";
import { AuditService } from "./audit.service.js";
import { InMemoryAuditRepository } from "./in-memory-audit.repository.js";

const service = new AuditService(new InMemoryAuditRepository());

export const auditRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.list("00000000-0000-0000-0000-000000000000") }));
};
