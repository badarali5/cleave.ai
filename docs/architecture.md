# Architecture Overview

## Product shape

Nimbus FinOps is a multi-tenant SaaS for AWS cost optimization.

The platform has three major runtime surfaces:

1. Web dashboard for onboarding, recommendations, approvals, savings, and reports.
2. API service for authentication, tenancy, ingestion, recommendations, execution, and audit.
3. Worker service for scheduled jobs, AI analysis, report generation, and remediation execution.

## Design goals

- Safe AWS integration with cross-account IAM roles
- Strong tenant isolation
- Human approval before destructive actions
- AI-assisted prioritization, not AI-only automation
- Full audit trail of inputs, decisions, and outcomes

## Runtime components

- Next.js web app
- Fastify API
- BullMQ-style background jobs
- PostgreSQL for system of record
- Redis for queues and transient state
- S3 for billing exports, report artifacts, and evidence bundles
- OpenTelemetry-style tracing and structured logs

## Request flow

1. User signs up and creates an organization.
2. User connects AWS through a cross-account role.
3. Worker ingests CUR, Cost Explorer, CloudWatch, Trusted Advisor, and Compute Optimizer data.
4. Detection rules and AI agents classify waste and opportunities.
5. Recommendations are stored with savings, confidence, and risk scores.
6. User approves a remediation.
7. Worker executes the safe AWS action and logs the result.
8. Savings are measured against baseline spend and reported weekly.
