import type { FastifyPluginAsync } from "fastify";
import { notificationService as service } from "./notification.context.js";

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request) => {
    const query = request.query as { organizationId?: string };
    if (!query.organizationId) {
      return { items: [] };
    }

    return { items: await service.list(query.organizationId) };
  });
};
