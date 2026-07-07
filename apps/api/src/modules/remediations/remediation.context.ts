import { InMemoryRemediationRepository } from "./in-memory-remediation.repository.js";
import { recommendationRepository } from "../recommendations/recommendation.context.js";
import { RemediationService } from "./remediation.service.js";
import { auditService } from "../audit/audit.context.js";
import { notificationService } from "../notifications/notification.context.js";
import { ledgerService } from "../ledger/ledger.context.js";

export const sharedRemediationRepository = new InMemoryRemediationRepository();
export const remediationService = new RemediationService(
	sharedRemediationRepository,
	recommendationRepository,
	auditService,
	notificationService,
	ledgerService,
);
