import { describe, expect, it } from "vitest";
import { RecommendationService } from "../src/modules/recommendations/recommendation.service.js";
import { InMemoryRecommendationRepository } from "../src/modules/recommendations/in-memory-recommendation.repository.js";

describe("Recommendation generation", () => {
  it("turns resource and billing signals into ranked recommendations", async () => {
    const service = new RecommendationService(new InMemoryRecommendationRepository());

    const items = await service.generateRecommendations({
      organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      billingSummary: {
        jobId: "11111111-1111-1111-1111-111111111111",
        organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        lineItemsParsed: 2,
        totalCost: 140.1,
        services: ["Amazon Elastic Compute Cloud", "Amazon Elastic Block Store"],
      },
      resources: [
        {
          id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          kind: "ec2_instance",
          resourceArn: "arn:aws:ec2:us-east-1:123456789012:instance/i-123456",
          name: "staging-instance",
          region: "us-east-1",
          status: "active",
          metrics: { cpuUtilization: 2, networkBytes: 100 },
        },
        {
          id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
          organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          kind: "ebs_volume",
          resourceArn: "arn:aws:ec2:us-east-1:123456789012:volume/vol-012345",
          name: "orphaned-volume",
          region: "us-east-1",
          status: "available",
          metrics: { attached: false, monthlyCost: 22.5 },
        },
      ],
    });

    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]?.estimatedMonthlySavings).toBeGreaterThan(items[1]?.estimatedMonthlySavings ?? 0);
    expect(items.some((item) => item.category === "idle_ec2")).toBe(true);
    expect(items.some((item) => item.category === "unattached_ebs")).toBe(true);
  });
});
