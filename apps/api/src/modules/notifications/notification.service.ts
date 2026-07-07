import type { InMemoryNotificationRepository } from "./in-memory-notification.repository.js";

export class NotificationService {
  constructor(private readonly repository: InMemoryNotificationRepository) {}

  list(organizationId: string) {
    return this.repository.list(organizationId);
  }

  create(input: { organizationId: string; userId: string | null; channel: "email" | "slack" | "in_app"; title: string; body: string }) {
    return this.repository.create(input);
  }
}
