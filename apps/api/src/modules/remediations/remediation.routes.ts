import type { FastifyPluginAsync } from "fastify";
import { remediationService as service } from "./remediation.context.js";

export const remediationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.listPlans("00000000-0000-0000-0000-000000000000") }));

  app.post("/from-recommendation/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const plan = await service.createPlanFromRecommendation(id);

    if (!plan) {
      return reply.status(404).send({ message: "recommendation not found" });
    }

    return reply.status(201).send({ plan });
  });

  app.post("/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const plan = await service.approvePlan(id);

    if (!plan) {
      return reply.status(404).send({ message: "remediation plan not found" });
    }

    return reply.send({ plan });
  });

  app.post("/:id/execute", async (request, reply) => {
    const { id } = request.params as { id: string };
    const plan = await service.executePlan(id);

    if (!plan) {
      return reply.status(404).send({ message: "remediation plan not found" });
    }

    return reply.send({ plan });
  });

  app.post("/:id/rollback", async (request, reply) => {
    const { id } = request.params as { id: string };
    const plan = await service.rollbackPlan(id);

    if (!plan) {
      return reply.status(404).send({ message: "remediation plan not found or rollback unavailable" });
    }

    return reply.send({ plan });
  });
};
