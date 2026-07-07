# API Specification

The API is REST-first and tenant-aware.

## Authentication and tenancy

- All endpoints require authentication except signup and login.
- Every request is scoped to a current organization.
- Membership role controls read and write permissions.

## Main endpoints

- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `GET /organizations`
- `POST /organizations`
- `GET /cloud-accounts`
- `POST /connect/aws`
- `GET /connect/aws?organizationId=:organizationId`
- `POST /connect/aws/:id/confirm`
- `POST /billing/cur/jobs`
- `GET /billing/cur/jobs`
- `GET /billing/cur/summaries`
- `GET /resources`
- `GET /recommendations`
- `POST /recommendations/generate`
- `POST /recommendations/:id/approve`
- `POST /recommendations/:id/execute`
- `GET /remediations`
- `POST /remediations/from-recommendation/:id`
- `POST /remediations/:id/approve`
- `POST /remediations/:id/execute`
- `POST /remediations/:id/rollback`
- `GET /reports`
- `GET /savings`
- `GET /audit-logs`
- `GET /notifications`

## Behavior rules

- `GET` routes must never expose cross-tenant data.
- Approval and execution must be separate actions.
- Destructive remediations require explicit confirmation or policy-based auto-approval.
- Responses should include stable IDs, timestamps, and status values.

## AWS onboarding contract

`POST /connect/aws` accepts an organization ID, AWS account ID, and optional CUR bucket hints.

The response includes:

- a generated `externalId`
- a deterministic `roleName` and `stackName`
- a CloudFormation console URL with the trust policy and read-only permissions encoded
- the exact permissions required for ingestion in phase 1
- security notes explaining why the trust boundary is safe

## CUR ingestion contract

`POST /billing/cur/jobs` registers a CUR source for an organization and cloud account.

The worker ingests CUR rows asynchronously and produces a summary containing:

- number of parsed line items
- total normalized spend
- distinct services found in the export

## Recommendation generation contract

`POST /recommendations/generate` accepts a billing summary plus a resource signal list.

The engine produces ranked recommendations using deterministic rules for:

- idle EC2 instances
- unattached EBS volumes
- unused Elastic IPs
- oversized RDS instances
- stale snapshots
- S3 lifecycle policy opportunities
- Savings Plans and Reserved Instance review

Each recommendation includes a savings estimate, a confidence score, and a risk score.

## Remediation contract

`POST /remediations/from-recommendation/:id` creates a safe remediation plan from an approved or open recommendation.

The plan includes:

- action type
- preflight checks
- execution steps
- rollback steps
- approval requirement
- risk and confidence scores
- safety notes

`POST /remediations/:id/approve` marks the plan approved.

`POST /remediations/:id/execute` executes the plan only if approval is not required or has already been granted.

`POST /remediations/:id/rollback` records the rollback outcome and updates the related recommendation status.




