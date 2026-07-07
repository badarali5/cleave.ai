import { randomUUID } from "node:crypto";
import type { SavingsRecord } from "./savings.types.js";

export class InMemorySavingsRepository {
  private readonly savings: SavingsRecord[] = [
    {
      id: randomUUID(),
      organizationId: "00000000-0000-0000-0000-000000000000",
      recommendationId: "11111111-1111-1111-1111-111111111111",
      baselineCost: 25000,
      actualCost: 23755.68,
      savingsAmount: 1244.32,
      measurementWindowStart: new Date().toISOString(),
      measurementWindowEnd: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  async list(organizationId: string) {
    return this.savings.filter((item) => item.organizationId === organizationId);
  }
}
