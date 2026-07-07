export type CostAnalysisResult = {
  findings: Array<{
    category: string;
    title: string;
    explanation: string;
    estimatedMonthlySavings: number;
    confidenceScore: number;
  }>;
};

export function analyzeCostSignals() : CostAnalysisResult {
  return {
    findings: [
      {
        category: "idle_ec2",
        title: "Idle EC2 instance detected",
        explanation: "CPU and network usage are below the operational threshold over the observation window.",
        estimatedMonthlySavings: 124.32,
        confidenceScore: 0.91,
      },
    ],
  };
}
