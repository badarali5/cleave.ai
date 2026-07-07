import { analyzeCostSignals } from "../agents/cost-analysis.agent.js";
import { generateReportSummary } from "../agents/report.agent.js";
import { runCurIngestionDemo } from "../ingestion/cur-ingestion.worker.js";
import { generateRecommendations } from "../../../../packages/domain/src/recommendation-engine.js";

export function runWorkerDemo() {
  const analysis = analyzeCostSignals();
  const report = generateReportSummary({ organizationName: "Demo Corp", savings: 124.32 });
  const ingestion = runCurIngestionDemo();
  const recommendations = generateRecommendations({
    organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    billingSummary: {
      jobId: "11111111-1111-1111-1111-111111111111",
      organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      lineItemsParsed: ingestion.summary.lineItemsParsed,
      totalCost: ingestion.summary.totalCost,
      services: ingestion.summary.services,
    },
    resources: [
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        kind: "ec2_instance",
        resourceArn: "arn:aws:ec2:us-east-1:123456789012:instance/i-123456",
        name: "staging-instance",
        region: "us-east-1",
        status: "active",
        metrics: { cpuUtilization: 2.4, networkBytes: 120 },
      },
      {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        kind: "ebs_volume",
        resourceArn: "arn:aws:ec2:us-east-1:123456789012:volume/vol-012345",
        name: "orphaned-volume",
        region: "us-east-1",
        status: "available",
        metrics: { attached: false, monthlyCost: 22.5 },
      },
    ],
  });

  return {
    analysis,
    report,
    ingestion,
    recommendations,
  };
}
