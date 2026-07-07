import type { FastifyPluginAsync } from "fastify";
import { InMemoryResourceRepository } from "./in-memory-resource.repository.js";
import { ResourceService } from "./resource.service.js";

const service = new ResourceService(new InMemoryResourceRepository());

export const resourceRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.list("00000000-0000-0000-0000-000000000000") }));
};
