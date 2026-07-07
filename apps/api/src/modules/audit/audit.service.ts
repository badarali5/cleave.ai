import type { InMemoryAuditRepository } from "./in-memory-audit.repository.js";

export class AuditService {
  constructor(private readonly repository: InMemoryAuditRepository) {}

  record(event: { organizationId: string; actorType: string; action: string; targetType: string; targetId?: string; metadata?: Record<string, unknown> }) {
    const payload: Parameters<InMemoryAuditRepository["append"]>[0] = {
      organizationId: event.organizationId,
      actorType: event.actorType,
      action: event.action,
      targetType: event.targetType,
      metadata: event.metadata ?? {},
    };

    if (event.targetId !== undefined) {
      payload.targetId = event.targetId;
    }

    return this.repository.append(payload);
  }

  list(organizationId: string) {
    return this.repository.list(organizationId);
  }
}
