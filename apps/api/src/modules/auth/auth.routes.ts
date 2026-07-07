import type { FastifyPluginAsync } from "fastify";
import { authService as service } from "./auth.context.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get("/provider", async () => ({ config: service.getProviderConfig() }));

  app.post("/login", async (request, reply) => {
    const body = request.body as { email?: string; password?: string };

    if (!body?.email || !body.password) {
      return reply.status(400).send({ message: "email and password are required" });
    }

    try {
      const result = await service.login({ email: body.email, password: body.password });
      return reply.send(result);
    } catch {
      return reply.status(401).send({ message: "invalid credentials" });
    }
  });

  app.post("/register-organization", async (request, reply) => {
    const body = request.body as { name?: string; slug?: string };

    if (!body?.name || !body.slug) {
      return reply.status(400).send({ message: "name and slug are required" });
    }

    try {
      return reply.status(201).send(await service.registerOrganization({ name: body.name, slug: body.slug }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "failed to register organization";
      return reply.status(409).send({ message });
    }
  });
};
