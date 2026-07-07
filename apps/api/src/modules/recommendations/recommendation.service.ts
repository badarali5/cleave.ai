import type { RecommendationRepository } from "./recommendation.repository.js";
import { generateRecommendations, type RecommendationGenerationInput } from "../../../../../packages/domain/src/recommendation-engine.js";
import type { Recommendation } from "./recommendation.types.js";

export class RecommendationService {
  constructor(private readonly repository: RecommendationRepository) {}

  listRecommendations() {
    return this.repository.list();
  }

  async approveRecommendation(id: string) {
    const recommendation = await this.repository.findById(id);

    if (!recommendation) {
      return null;
    }

    recommendation.status = "approved";
    await this.repository.save(recommendation);

    return recommendation;
  }

  async executeRecommendation(id: string) {
    const recommendation = await this.repository.findById(id);

    if (!recommendation) {
      return null;
    }

    recommendation.status = "executed";
    await this.repository.save(recommendation);

    return recommendation;
  }

  async generateRecommendations(input: RecommendationGenerationInput) {
    const generated = generateRecommendations(input).map<Recommendation>((item) => ({
      id: item.id,
      organizationId: item.organizationId,
      resourceId: item.resourceId,
      category: item.category,
      title: item.title,
      explanation: item.explanation,
      estimatedMonthlySavings: item.estimatedMonthlySavings,
      confidenceScore: item.confidenceScore,
      riskScore: item.riskScore,
      status: item.status,
      createdAt: item.createdAt,
    }));

    await this.repository.saveMany(generated);

    return generated;
  }
}
