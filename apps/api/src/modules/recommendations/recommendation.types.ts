export type Recommendation = {
  id: string;
  organizationId: string;
  resourceId: string | null;
  category: string;
  title: string;
  explanation: string;
  estimatedMonthlySavings: number;
  confidenceScore: number;
  riskScore: number;
  status: "open" | "approved" | "executing" | "executed" | "rejected";
  createdAt: string;
  remediationScript?: string;
  riskScore1To5?: number;
};
