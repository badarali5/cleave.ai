import type { FastifyPluginAsync } from "fastify";
import { BillingService } from "./billing.service.js";

const service = new BillingService();

export const billingRoutes: FastifyPluginAsync = async (app) => {
  app.post("/invoice/preview", async (request, reply) => {
    const body = request.body as { organizationId?: string; realizedSavings?: number; successFeeRate?: number; currency?: string };

    if (!body?.organizationId || typeof body.realizedSavings !== "number") {
      return reply.status(400).send({ message: "organizationId and realizedSavings are required" });
    }

    return reply.send({ invoice: service.previewInvoice(body) });
  });

  app.post("/stripe/webhook", async (request) => {
    const body = request.body as { eventType?: string; payload?: Record<string, unknown> };

    return service.handleStripeWebhook({
      eventType: body?.eventType ?? "unknown",
      payload: body?.payload ?? {},
    });
  });
};
