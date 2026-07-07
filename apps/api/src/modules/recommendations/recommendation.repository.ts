import type { Recommendation } from "./recommendation.types.js";

export interface RecommendationRepository {
  list(): Promise<Recommendation[]>;
  findById(id: string): Promise<Recommendation | undefined>;
  save(recommendation: Recommendation): Promise<void>;
  saveMany(recommendations: Recommendation[]): Promise<void>;
}
