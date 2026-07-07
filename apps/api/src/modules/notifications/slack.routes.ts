import type { FastifyPluginAsync } from "fastify";
import { SlackService } from "./slack.service.js";

const service = new SlackService();

export const slackRoutes: FastifyPluginAsync = async (app) => {
  app.post("/slack/test", async (request, reply) => {
    const body = request.body as { webhookUrl?: string; title?: string; body?: string };

    if (!body?.title || !body.body) {
      return reply.status(400).send({ message: "title and body are required" });
    }

    return reply.send(
      await service.sendWebhook({
        webhookUrl: body.webhookUrl ?? process.env.SLACK_WEBHOOK_URL ?? "",
        title: body.title,
        body: body.body,
      }),
    );
  });
};