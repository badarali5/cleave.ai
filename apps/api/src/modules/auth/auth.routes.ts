import type { FastifyPluginAsync } from "fastify";
import { AuthService } from "./auth.service.js";

const service = new AuthService();

export const authRoutes: FastifyPluginAsync = async (app) => {
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
};
