# CUR Ingestion

CUR is the raw billing source of truth for the platform.

The ingestion pipeline is intentionally separated from the onboarding flow:

1. AWS onboarding establishes the secure cross-account role.
2. CUR ingestion registers the billing source and creates a queued job.
3. The worker parses CUR rows into normalized cost facts.
4. Summaries are stored for dashboards, forecasting, and recommendation generation.

## Why this matters

- Cost Explorer is useful for summaries, but CUR gives the detailed rows needed for resource correlation.
- Large CUR exports should be parsed in a worker, not in the request lifecycle.
- The system should preserve both raw and normalized forms.

## Normalization strategy

- Parse each CSV row into a typed line item.
- Extract service, usage type, resource ARN or resource ID, cost, usage quantity, currency, and tags.
- Aggregate per job into a summary for the dashboard.

## MVP scope

- Accept a CUR bucket registration request.
- Create a queued ingestion job.
- Parse uploaded CUR CSV in a worker.
- Store a summary of lines, services, and total cost.

## Next production step

The next hardening step is replacing the in-memory repository with PostgreSQL tables and adding an S3 manifest fetcher so the worker can pull CUR exports directly from AWS.
