import { randomUUID } from "node:crypto";
import type { AuditEvent } from "./audit.types.js";

export class InMemoryAuditRepository {
  private readonly events: AuditEvent[] = [];

  async append(input: Omit<AuditEvent, "id" | "createdAt"> & { targetId?: string }) {
    const event: AuditEvent = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    this.events.push(event);

    return event;
  }

  async list(organizationId: string) {
    return this.events.filter((event) => event.organizationId === organizationId);
  }
}
