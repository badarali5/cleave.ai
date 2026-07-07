import type { InMemoryLedgerRepository } from "./in-memory-ledger.repository.js";

export class LedgerService {
  constructor(private readonly repository: InMemoryLedgerRepository) {}

  list(organizationId: string) {
    return this.repository.list(organizationId);
  }

  recordSavings(input: {
    organizationId: string;
    recommendationId: string | null;
    remediationPlanId: string | null;
    periodStart: string;
    periodEnd: string;
    baselineCost: number;
    actualCost: number;
    expectedSavings: number;
    notes?: string;
  }) {
    return this.repository.create({
      organizationId: input.organizationId,
      recommendationId: input.recommendationId,
      remediationPlanId: input.remediationPlanId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      baselineCost: input.baselineCost,
      actualCost: input.actualCost,
      deltaSavings: Number((input.baselineCost - input.actualCost).toFixed(2)),
      expectedSavings: input.expectedSavings,
      notes: input.notes ?? null,
      status: "pending",
    });
  }

  reconcile(id: string, input: { actualCost: number; notes?: string }) {
    return this.repository.reconcile(id, input);
  }
}
