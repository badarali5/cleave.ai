import type { FastifyPluginAsync } from "fastify";
import { auditService as service } from "./audit.context.js";

export const auditRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request) => {
    const query = request.query as { organizationId?: string };
    if (!query.organizationId) {
      return { items: [] };
    }

    return { items: await service.list(query.organizationId) };
  });
};
