import type { InMemorySavingsRepository } from "./in-memory-savings.repository.js";

export class SavingsService {
  constructor(private readonly repository: InMemorySavingsRepository) {}

  list(organizationId: string) {
    return this.repository.list(organizationId);
  }
}
