# AWS Cross-Account Onboarding

This module is the security boundary for Nimbus FinOps.

The platform does not ask for permanent AWS access keys. Instead, it generates a cross-account IAM role with an `ExternalId` condition and a least-privilege read-only policy.

## Why this exists

- It prevents storing long-lived AWS credentials.
- It allows the SaaS backend to assume a temporary identity inside the customer account.
- It makes onboarding repeatable and auditable.
- It keeps phase 1 read-only so the platform can collect data before it is allowed to remediate anything.

## What the generated stack does

The onboarding response now includes:

- a deterministic role name
- a unique `ExternalId`
- a CloudFormation console URL
- the full template body
- a list of required permissions
- a list of next steps and security notes

The CloudFormation stack creates:

1. `AWS::IAM::Role` with a trust policy that requires the SaaS principal ARN and matching `ExternalId`
2. An inline read-only policy for Cost Explorer, CloudWatch, CloudTrail, EC2, RDS, Trusted Advisor, Compute Optimizer, and tagging discovery
3. An optional CUR bucket policy if the customer provides billing export details

## Why ExternalId matters

`ExternalId` is a defense against the confused deputy problem.

Without it, another AWS principal could try to trick your SaaS into assuming the wrong customer role. With it, the trust relationship only works when the caller knows the exact generated value.

## Boto3 assume-role pattern

The same trust model maps cleanly to Python workers that need temporary AWS credentials.

```python
import boto3

sts = boto3.client("sts")

response = sts.assume_role(
    RoleArn="arn:aws:iam::123456789012:role/NimbusFinOpsReadOnly-9012",
    RoleSessionName="nimbus-finops-ingestion",
    ExternalId="generated-external-id-from-onboarding",
    DurationSeconds=3600,
)

creds = response["Credentials"]

session = boto3.Session(
    aws_access_key_id=creds["AccessKeyId"],
    aws_secret_access_key=creds["SecretAccessKey"],
    aws_session_token=creds["SessionToken"],
)
```

## Common mistakes

- Using IAM user keys instead of a cross-account role
- Omitting `ExternalId`
- Granting write access in phase 1
- Assuming CUR can be read without S3 permissions
- Treating Cost Explorer as a replacement for CUR rather than a summary source

## Why the current implementation is safe

- It validates the AWS account ID format.
- It generates the trust policy centrally.
- It returns the exact permissions required up front.
- It keeps the role read-only in phase 1.
- It records a pending onboarding plan before connection confirmation.
