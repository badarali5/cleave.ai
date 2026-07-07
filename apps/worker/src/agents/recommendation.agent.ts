export function buildRecommendation(input: {
  category: string;
  title: string;
  explanation: string;
  estimatedMonthlySavings: number;
  confidenceScore: number;
  riskScore: number;
}) {
  return {
    ...input,
    status: "open" as const,
    createdAt: new Date().toISOString(),
  };
}
