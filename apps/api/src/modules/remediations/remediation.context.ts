import { InMemoryRemediationRepository } from "./in-memory-remediation.repository.js";
import { recommendationRepository } from "../recommendations/recommendation.context.js";
import { RemediationService } from "./remediation.service.js";

export const sharedRemediationRepository = new InMemoryRemediationRepository();
export const remediationService = new RemediationService(sharedRemediationRepository, recommendationRepository);
