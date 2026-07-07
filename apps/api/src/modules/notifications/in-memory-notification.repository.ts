import { randomUUID } from "node:crypto";
import type { Notification } from "./notification.types.js";

export class InMemoryNotificationRepository {
  private readonly notifications: Notification[] = [];

  async list(organizationId: string) {
    return this.notifications.filter((notification) => notification.organizationId === organizationId);
  }

  async create(input: Omit<Notification, "id" | "createdAt" | "status">) {
    const notification: Notification = {
      ...input,
      id: randomUUID(),
      status: "queued",
      createdAt: new Date().toISOString(),
    };

    this.notifications.push(notification);

    return notification;
  }
}
