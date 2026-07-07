import { describe, expect, it } from "vitest";
import { InMemoryRecommendationRepository } from "../src/modules/recommendations/in-memory-recommendation.repository.js";
import { InMemoryRemediationRepository } from "../src/modules/remediations/in-memory-remediation.repository.js";
import { RemediationService } from "../src/modules/remediations/remediation.service.js";

describe("RemediationService", () => {
  it("creates, approves, executes, and rolls back a remediation plan", async () => {
    const recommendationRepository = new InMemoryRecommendationRepository();
    const remediationRepository = new InMemoryRemediationRepository();
    const service = new RemediationService(remediationRepository, recommendationRepository);

    const plan = await service.createPlanFromRecommendation("11111111-1111-1111-1111-111111111111");

    expect(plan).not.toBeNull();
    expect(plan?.requiresApproval).toBe(false);
    expect(plan?.preflightChecks.length).toBeGreaterThan(0);

    const approved = await service.approvePlan(plan!.id);
    expect(approved?.status).toBe("approved");

    const executed = await service.executePlan(plan!.id);
    expect(executed?.status).toBe("succeeded");
    expect(executed?.resultMessage).toContain("Executed");

    const rolledBack = await service.rollbackPlan(plan!.id);
    expect(rolledBack?.status).toBe("rolled_back");
  });
});
