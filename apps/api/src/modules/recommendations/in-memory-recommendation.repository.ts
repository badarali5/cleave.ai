import type { RecommendationRepository } from "./recommendation.repository.js";
import type { Recommendation } from "./recommendation.types.js";

export class InMemoryRecommendationRepository implements RecommendationRepository {
  private readonly recommendations: Recommendation[] = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      organizationId: "00000000-0000-0000-0000-000000000000",
      resourceId: null,
      category: "idle_ec2",
      title: "Idle EC2 instance detected",
      explanation: "The instance has low CPU and network activity over the last 14 days.",
      estimatedMonthlySavings: 124.32,
      confidenceScore: 0.91,
      riskScore: 0.22,
      status: "open",
      createdAt: new Date().toISOString(),
    },
  ];

  async list() {
    return this.recommendations;
  }

  async findById(id: string) {
    return this.recommendations.find((recommendation) => recommendation.id === id);
  }

  async save(recommendation: Recommendation) {
    const index = this.recommendations.findIndex((item) => item.id === recommendation.id);
    if (index >= 0) {
      this.recommendations[index] = recommendation;
      return;
    }

    this.recommendations.push(recommendation);
  }

  async saveMany(recommendations: Recommendation[]) {
    for (const recommendation of recommendations) {
      await this.save(recommendation);
    }
  }
}
