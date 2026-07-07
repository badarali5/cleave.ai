import type { FastifyPluginAsync } from "fastify";
import { InMemorySavingsRepository } from "./in-memory-savings.repository.js";
import { SavingsService } from "./savings.service.js";

const service = new SavingsService(new InMemorySavingsRepository());

export const savingsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.list("00000000-0000-0000-0000-000000000000") }));
};
