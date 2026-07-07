# Database Schema

PostgreSQL is the source of truth. Every table is tenant-scoped.

## Core entities

- `users`
- `organizations`
- `memberships`
- `cloud_accounts`
- `aws_integrations`
- `resources`
- `cost_records`
- `recommendations`
- `remediation_jobs`
- `savings_records`
- `reports`
- `audit_logs`
- `agent_executions`
- `notifications`
- `sessions`

## Key relationships

- One organization has many users through memberships.
- One organization has many AWS cloud accounts.
- One cloud account has many resources and cost records.
- One resource can have many recommendations.
- One recommendation can spawn many remediation jobs.
- One organization has many audit events and notifications.

## Important fields

- `tenant_id` or `organization_id` on every business table
- `status` on workflow tables
- `risk_score` and `confidence_score` on recommendations
- `external_id` for AWS identifiers
- `created_at`, `updated_at`, `deleted_at` where soft deletion is useful

## Storage strategy

- Store raw CUR files and generated PDFs in object storage.
- Store normalized facts in PostgreSQL.
- Keep AI outputs as derived records with explicit model metadata.
