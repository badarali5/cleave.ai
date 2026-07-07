export type LedgerEntryStatus = "pending" | "reconciled" | "disputed";

export type LedgerEntry = {
  id: string;
  organizationId: string;
  recommendationId: string | null;
  remediationPlanId: string | null;
  periodStart: string;
  periodEnd: string;
  baselineCost: number;
  actualCost: number;
  deltaSavings: number;
  expectedSavings: number;
  status: LedgerEntryStatus;
  createdAt: string;
  reconciledAt: string | null;
  notes: string | null;
};
