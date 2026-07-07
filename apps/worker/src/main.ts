const jobs = [
  "billing-ingestion",
  "resource-sync",
  "cost-analysis",
  "report-generation",
  "remediation-execution",
];

console.log(JSON.stringify({ service: "worker", jobs, startedAt: new Date().toISOString() }, null, 2));
