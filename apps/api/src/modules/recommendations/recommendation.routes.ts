import type { FastifyPluginAsync } from "fastify";
import { recommendationService as service } from "./recommendation.context.js";

export const recommendationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.listRecommendations() }));

  app.post("/generate", async (request, reply) => {
    const body = request.body as {
      organizationId?: string;
      cloudAccountId?: string;
      billingSummary?: {
        jobId?: string;
        lineItemsParsed?: number;
        totalCost?: number;
        services?: string[];
      };
      resources?: Array<{
        id: string;
        organizationId: string;
        cloudAccountId: string | null;
        kind: string;
        resourceArn: string;
        name?: string | null;
        region?: string | null;
        status?: string;
        metrics?: {
          cpuUtilization?: number;
          networkBytes?: number;
          attached?: boolean;
          ageDays?: number;
          monthlyCost?: number;
          objectAgeDays?: number;
        };
      }>;
    };

    if (!body?.organizationId || !body.cloudAccountId || !body.billingSummary) {
      return reply.status(400).send({ message: "organizationId, cloudAccountId, and billingSummary are required" });
    }

    const generated = await service.generateRecommendations({
      organizationId: body.organizationId,
      cloudAccountId: body.cloudAccountId,
      billingSummary: {
        organizationId: body.organizationId,
        cloudAccountId: body.cloudAccountId,
        lineItemsParsed: body.billingSummary.lineItemsParsed ?? 0,
        totalCost: body.billingSummary.totalCost ?? 0,
        services: body.billingSummary.services ?? [],
        ...(body.billingSummary.jobId ? { jobId: body.billingSummary.jobId } : {}),
      },
      resources: body.resources ?? [],
    });

    return reply.status(201).send({ items: generated });
  });

  app.post("/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const recommendation = await service.approveRecommendation(id);

    if (!recommendation) {
      return reply.status(404).send({ message: "recommendation not found" });
    }

    return reply.send({ recommendation });
  });

  app.post("/:id/execute", async (request, reply) => {
    const { id } = request.params as { id: string };
    const recommendation = await service.executingRecommendation(id);

    if (!recommendation) {
      return reply.status(404).send({ message: "recommendation not found" });
    }

    const { randomUUID } = await import("node:crypto");
    const { InMemoryJobQueue } = await import("../../../../worker/src/queue/in-memory-job-queue.js");
    const queue = new InMemoryJobQueue();

    queue.enqueue({
      id: `job-remediation-${randomUUID()}`,
      type: "remediation-execution",
      payload: {
        recommendationId: recommendation.id,
        organizationId: recommendation.organizationId,
      },
    });

    return reply.send({
      recommendation,
      jobStatus: "queued",
      rollbackAvailable: true,
    });
  });

  app.post("/:id/reject", async (request, reply) => {
    const { id } = request.params as { id: string };
    const recommendation = await service.rejectRecommendation(id);

    if (!recommendation) {
      return reply.status(404).send({ message: "recommendation not found" });
    }

    return reply.send({ recommendation });
  });
};
