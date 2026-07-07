export type AuditEvent = {
  id: string;
  organizationId: string;
  actorType: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};
