import { readDbFile, writeDbFile } from "@finops/domain";
import { randomUUID } from "node:crypto";
import type { AuditEvent } from "./audit.types.js";

export class InMemoryAuditRepository {
  private get events(): AuditEvent[] {
    return readDbFile<AuditEvent[]>("audit.json", []);
  }

  private set events(value: AuditEvent[]) {
    writeDbFile("audit.json", value);
  }

  async append(input: Omit<AuditEvent, "id" | "createdAt"> & { targetId?: string }) {
    const currentEvents = this.events;
    const event: AuditEvent = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    currentEvents.push(event);
    this.events = currentEvents;

    return event;
  }

  async list(organizationId: string) {
    return this.events.filter((event) => event.organizationId === organizationId);
  }
}
