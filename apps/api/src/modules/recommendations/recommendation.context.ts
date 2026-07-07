import { InMemoryRecommendationRepository } from "./in-memory-recommendation.repository.js";
import { RecommendationService } from "./recommendation.service.js";

export const recommendationRepository = new InMemoryRecommendationRepository();
export const recommendationService = new RecommendationService(recommendationRepository);
