import { readDbFile, writeDbFile } from "@finops/domain";
import type { RecommendationRepository } from "./recommendation.repository.js";
import type { Recommendation } from "./recommendation.types.js";

export class InMemoryRecommendationRepository implements RecommendationRepository {
  private get recommendations(): Recommendation[] {
    const defaultRecs: Recommendation[] = [
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
    return readDbFile<Recommendation[]>("recommendations.json", defaultRecs);
  }

  private set recommendations(value: Recommendation[]) {
    writeDbFile("recommendations.json", value);
  }

  async list() {
    return this.recommendations;
  }

  async findById(id: string) {
    return this.recommendations.find((recommendation) => recommendation.id === id);
  }

  async save(recommendation: Recommendation) {
    const current = this.recommendations;
    const index = current.findIndex((item) => item.id === recommendation.id);
    if (index >= 0) {
      current[index] = recommendation;
    } else {
      current.push(recommendation);
    }
    this.recommendations = current;
  }

  async saveMany(recommendations: Recommendation[]) {
    const current = this.recommendations;
    for (const recommendation of recommendations) {
      const index = current.findIndex((item) => item.id === recommendation.id);
      if (index >= 0) {
        current[index] = recommendation;
      } else {
        current.push(recommendation);
      }
    }
    this.recommendations = current;
  }
}
