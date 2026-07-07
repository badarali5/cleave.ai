export type SavingsRecord = {
  id: string;
  organizationId: string;
  recommendationId: string | null;
  baselineCost: number;
  actualCost: number;
  savingsAmount: number;
  measurementWindowStart: string;
  measurementWindowEnd: string;
  createdAt: string;
};
