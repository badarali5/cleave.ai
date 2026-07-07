# Nimbus FinOps

Nimbus FinOps is an AI-native, multi-tenant AWS cost optimization platform.

It starts as an AI-assisted FinOps copilot and evolves into a safe remediation SaaS for engineering and finance teams.

## What is in this repo

- `apps/web`: Next.js customer dashboard
- `apps/api`: Fastify API with clean architecture
- `apps/worker`: background jobs for ingestion, analysis, reporting, and remediation
- `packages/domain`: shared domain models and validation
- `docs`: architecture, schema, API, agent, and roadmap specs

## Core principles

- Multi-tenant by default
- Read-only first, then approval-based remediation
- Deterministic rules first, AI for synthesis and prioritization
- Full auditability for every recommendation and action
- PostgreSQL as the source of truth

## Local stack

Run PostgreSQL and Redis with Docker Compose, then start the web, API, and worker packages from the workspace root.
