export function generateReportSummary(input: { organizationName: string; savings: number }) {
  return `Weekly FinOps summary for ${input.organizationName}: estimated savings ${input.savings.toFixed(2)} USD.`;
}
