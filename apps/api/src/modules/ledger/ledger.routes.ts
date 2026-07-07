import type { FastifyPluginAsync } from "fastify";
import { ledgerService } from "./ledger.context.js";

export const ledgerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async (request) => {
    const query = request.query as { organizationId?: string };

    if (!query.organizationId) {
      return { items: [] };
    }

    return { items: await ledgerService.list(query.organizationId) };
  });

  app.post("/reconcile", async (request, reply) => {
    const body = request.body as {
      entryId?: string;
      actualCost?: number;
      notes?: string;
    };

    if (!body?.entryId || typeof body.actualCost !== "number") {
      return reply.status(400).send({ message: "entryId and actualCost are required" });
    }

    const entry = await ledgerService.reconcile(body.entryId, {
      actualCost: body.actualCost,
      notes: body.notes,
    });

    if (!entry) {
      return reply.status(404).send({ message: "ledger entry not found" });
    }

    return reply.send({ entry });
  });
};
