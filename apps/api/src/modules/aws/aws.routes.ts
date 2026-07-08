import type { FastifyPluginAsync } from "fastify";
import { AwsOnboardingService } from "./aws.service.js";

const service = new AwsOnboardingService();

export const awsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", async (request, reply) => {
    const body = request.body as {
      organizationId?: string;
      accountId?: string;
      accountAlias?: string;
      curBucketName?: string;
      curBucketPrefix?: string;
      saasPrincipalArn?: string;
    };

    if (!body?.organizationId || !body.accountId) {
      return reply.status(400).send({ message: "organizationId and accountId are required" });
    }

    try {
      const request = {
        organizationId: body.organizationId,
        accountId: body.accountId,
        ...(body.accountAlias ? { accountAlias: body.accountAlias } : {}),
        ...(body.curBucketName ? { curBucketName: body.curBucketName } : {}),
        ...(body.curBucketPrefix ? { curBucketPrefix: body.curBucketPrefix } : {}),
        ...(body.saasPrincipalArn ? { saasPrincipalArn: body.saasPrincipalArn } : {}),
      };

      return reply.status(201).send(service.createOnboardingPlan(request));
    } catch (error) {
      const message = error instanceof Error ? error.message : "failed to create AWS onboarding plan";
      return reply.status(400).send({ message });
    }
  });

  app.get("/", async (request) => {
    const query = request.query as { organizationId?: string };

    if (!query.organizationId) {
      return { items: [] };
    }

    return { items: await service.listPlans(query.organizationId) };
  });

  app.post("/:id/confirm", async (request, reply) => {
    const { id } = request.params as { id: string };
    const plan = await service.confirmConnection(id);

    if (!plan) {
      return reply.status(404).send({ message: "AWS onboarding plan not found" });
    }

    return reply.send({ plan });
  });

  app.post("/:id/validate", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { roleArn?: string; externalId?: string };

    if (!body?.roleArn || !body.externalId) {
      return reply.status(400).send({ message: "roleArn and externalId are required" });
    }

    const result = await service.validateConnection(id, body);

    if (!result) {
      return reply.status(404).send({ message: "AWS onboarding plan not found" });
    }

    if (result.verified) {
      const plan = await service.confirmConnection(id);
      if (plan) {
        const { randomUUID } = await import("node:crypto");
        const { InMemoryJobQueue } = await import("../../../../worker/src/queue/in-memory-job-queue.js");
        const queue = new InMemoryJobQueue();
        queue.enqueue({
          id: `job-ingestion-${randomUUID()}`,
          type: "billing-ingestion",
          payload: {
            organizationId: plan.organizationId,
            cloudAccountId: plan.id,
          },
        });
      }
    }

    return reply.send({ result });
  });
};
