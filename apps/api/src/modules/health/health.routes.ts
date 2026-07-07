import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  }));
};
