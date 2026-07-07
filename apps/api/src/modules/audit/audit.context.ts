import { AuditService } from "./audit.service.js";
import { InMemoryAuditRepository } from "./in-memory-audit.repository.js";

export const auditRepository = new InMemoryAuditRepository();
export const auditService = new AuditService(auditRepository);
