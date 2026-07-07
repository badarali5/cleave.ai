import type { FastifyPluginAsync } from "fastify";
import { BillingIngestionService } from "./billing-ingestion.service.js";
import { InMemoryBillingIngestionRepository } from "./in-memory-billing-ingestion.repository.js";

const service = new BillingIngestionService(new InMemoryBillingIngestionRepository());

export const billingIngestionRoutes: FastifyPluginAsync = async (app) => {
  app.post("/cur/jobs", async (fastifyRequest, reply) => {
    const body = fastifyRequest.body as {
      organizationId?: string;
      cloudAccountId?: string;
      bucketName?: string;
      bucketPrefix?: string;
      reportName?: string;
      sourceType?: "s3_manifest" | "csv_upload";
    };

    if (!body?.organizationId || !body.cloudAccountId) {
      return reply.status(400).send({ message: "organizationId and cloudAccountId are required" });
    }

    const jobRequest = {
      organizationId: body.organizationId,
      cloudAccountId: body.cloudAccountId,
      ...(body.bucketName ? { bucketName: body.bucketName } : {}),
      ...(body.bucketPrefix ? { bucketPrefix: body.bucketPrefix } : {}),
      ...(body.reportName ? { reportName: body.reportName } : {}),
      ...(body.sourceType ? { sourceType: body.sourceType } : {}),
    };

    const job = await service.createCurJob(jobRequest);

    return reply.status(202).send({ job });
  });

  app.get("/cur/jobs", async (request) => {
    const query = request.query as { organizationId?: string };
    if (!query.organizationId) {
      return { items: [] };
    }

    return { items: await service.listCurJobs(query.organizationId) };
  });

  app.get("/cur/summaries", async (request) => {
    const query = request.query as { organizationId?: string };
    if (!query.organizationId) {
      return { items: [] };
    }

    return { items: await service.listSummaries(query.organizationId) };
  });
};
