import { describe, expect, it } from "vitest";
import { InMemoryRecommendationRepository } from "../src/modules/recommendations/in-memory-recommendation.repository.js";
import { RecommendationService } from "../src/modules/recommendations/recommendation.service.js";

describe("RecommendationService", () => {
  it("approves and executes a recommendation", async () => {
    const service = new RecommendationService(new InMemoryRecommendationRepository());
    const approved = await service.approveRecommendation("11111111-1111-1111-1111-111111111111");
    expect(approved?.status).toBe("approved");

    const executed = await service.executeRecommendation("11111111-1111-1111-1111-111111111111");
    expect(executed?.status).toBe("executed");
  });
});
