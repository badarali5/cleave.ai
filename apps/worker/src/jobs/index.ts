import { analyzeCostSignals } from "../agents/cost-analysis.agent.js";
import { generateReportSummary } from "../agents/report.agent.js";
import { runCurIngestionDemo } from "../ingestion/cur-ingestion.worker.js";
import { generateRecommendationDemo } from "../agents/recommendation-demo.js";

export function runWorkerDemo() {
  const analysis = analyzeCostSignals();
  const report = generateReportSummary({ organizationName: "Demo Corp", savings: 124.32 });
  const ingestion = runCurIngestionDemo();
  const recommendations = generateRecommendationDemo();

  return {
    analysis,
    report,
    ingestion,
    recommendations,
  };
}
