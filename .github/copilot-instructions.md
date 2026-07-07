# Nimbus FinOps Copilot Instructions

This workspace is a production-oriented AI FinOps SaaS monorepo.

## Working rules

- Prefer clean architecture, explicit interfaces, and domain-first design.
- Keep AWS reads separate from AWS writes.
- Require approval for risky remediations.
- Maintain tenant isolation in every database query and API handler.
- Favor deterministic rules for detection and AI for explanation, ranking, and summarization.
- Write concise, testable modules with clear boundaries.
- Update docs when architecture, schema, or API behavior changes.

## Repo layout

- `apps/web` for the customer UI
- `apps/api` for public and internal APIs
- `apps/worker` for async jobs and scheduled workflows
- `packages/domain` for shared types, schemas, and policies
- `docs` for the system design source of truth
