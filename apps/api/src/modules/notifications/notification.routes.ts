import type { FastifyPluginAsync } from "fastify";
import { InMemoryNotificationRepository } from "./in-memory-notification.repository.js";
import { NotificationService } from "./notification.service.js";

const service = new NotificationService(new InMemoryNotificationRepository());

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.list("00000000-0000-0000-0000-000000000000") }));
};
