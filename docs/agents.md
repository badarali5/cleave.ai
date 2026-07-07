# AI Agent Workflow

## Cost Analysis Agent

- Ingests billing and usage data.
- Normalizes spend by service, account, region, and tag.
- Detects anomalies and candidate waste.

## Resource Classification Agent

- Labels idle, zombie, oversized, orphaned, and stale resources.
- Uses rules first, then AI for ambiguous cases.

## Recommendation Agent

- Converts findings into ranked recommendations.
- Estimates savings, confidence, and risk.
- Explains assumptions and rollback options.

## Remediation Agent

- Executes approved AWS actions.
- Performs pre-flight checks and records evidence.
- Supports rollback when safe and feasible.

## Report Agent

- Generates weekly, monthly, executive, and engineering summaries.
- Produces PDF and Slack-ready outputs.
