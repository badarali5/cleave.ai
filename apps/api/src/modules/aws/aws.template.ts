type CloudFormationTemplate = Record<string, unknown>;

function sanitizeName(value: string) {
  return value.replace(/[^A-Za-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function buildRoleName(accountId: string) {
  return `NimbusFinOpsReadOnly-${accountId.slice(-4)}`;
}

export function buildStackName(organizationId: string, accountId: string) {
  return sanitizeName(`nimbus-finops-${organizationId.slice(0, 8)}-${accountId.slice(-4)}`);
}

export function buildRequiredPermissions() {
  return [
    "ce:GetCostAndUsage",
    "ce:GetCostForecast",
    "ce:GetDimensionValues",
    "cur:DescribeReportDefinitions",
    "organizations:DescribeOrganization",
    "cloudwatch:GetMetricData",
    "cloudwatch:ListMetrics",
    "cloudtrail:LookupEvents",
    "ec2:DescribeInstances",
    "ec2:DescribeVolumes",
    "ec2:DescribeSnapshots",
    "ec2:DescribeAddresses",
    "ec2:DescribeRegions",
    "elasticloadbalancing:DescribeLoadBalancers",
    "rds:DescribeDBInstances",
    "rds:DescribeDBSnapshots",
    "tag:GetResources",
    "support:DescribeTrustedAdvisorChecks",
    "support:DescribeTrustedAdvisorCheckResult",
    "compute-optimizer:GetRecommendationSummaries",
  ];
}

function buildAssumeRolePolicy(principalArn: string, externalId: string) {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: principalArn },
        Action: "sts:AssumeRole",
        Condition: {
          StringEquals: {
            "sts:ExternalId": externalId,
          },
        },
      },
    ],
  };
}

function buildReadOnlyPolicy() {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: buildRequiredPermissions(),
        Resource: "*",
      },
    ],
  };
}

function buildCurPolicy(bucketName: string, bucketPrefix: string) {
  const normalizedPrefix = bucketPrefix.endsWith("/") || bucketPrefix.length === 0 ? bucketPrefix : `${bucketPrefix}/`;

  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["s3:ListBucket"],
        Resource: {
          "Fn::Sub": ["arn:${AWS::Partition}:s3:::${BucketName}", { BucketName: bucketName }],
        },
      },
      {
        Effect: "Allow",
        Action: ["s3:GetObject"],
        Resource: {
          "Fn::Sub": [
            "arn:${AWS::Partition}:s3:::${BucketName}/${BucketPrefix}*",
            {
              BucketName: bucketName,
              BucketPrefix: normalizedPrefix,
            },
          ],
        },
      },
    ],
  };
}

export function buildCloudFormationTemplate(input: {
  roleName: string;
  principalArn: string;
  externalId: string;
  curBucketName?: string | undefined;
  curBucketPrefix?: string | undefined;
}) {
  const resources: Record<string, unknown> = {
    FinOpsReadOnlyRole: {
      Type: "AWS::IAM::Role",
      Properties: {
        RoleName: input.roleName,
        AssumeRolePolicyDocument: buildAssumeRolePolicy(input.principalArn, input.externalId),
        Path: "/",
        Description: "Read-only role for Nimbus FinOps cross-account ingestion.",
        MaxSessionDuration: 3600,
        ManagedPolicyArns: [],
        Policies: [
          {
            PolicyName: "NimbusFinOpsReadOnlyPolicy",
            PolicyDocument: buildReadOnlyPolicy(),
          },
        ],
      },
    },
  };

  if (input.curBucketName) {
    resources.FinOpsCurReadPolicy = {
      Type: "AWS::IAM::Policy",
      Properties: {
        PolicyName: "NimbusFinOpsCurReadPolicy",
        PolicyDocument: buildCurPolicy(input.curBucketName, input.curBucketPrefix ?? ""),
        Roles: [{ Ref: "FinOpsReadOnlyRole" }],
      },
    };
  }

  const template: CloudFormationTemplate = {
    AWSTemplateFormatVersion: "2010-09-09",
    Description: "Nimbus FinOps read-only cross-account role for AWS cost and resource ingestion.",
    Parameters: {
      StackNameHint: {
        Type: "String",
        Default: "NimbusFinOps",
        Description: "Friendly hint for the deployment name.",
      },
    },
    Resources: resources,
    Outputs: {
      RoleArn: {
        Value: { "Fn::GetAtt": ["FinOpsReadOnlyRole", "Arn"] },
        Description: "IAM role ARN to configure in the SaaS account connection record.",
      },
    },
  };

  return JSON.stringify(template, null, 2);
}

export function buildCloudFormationConsoleUrl(stackName: string, templateBody: string) {
  const baseUrl = "https://console.aws.amazon.com/cloudformation/home#/stacks/create/review";
  return `${baseUrl}?stackName=${encodeURIComponent(stackName)}&templateBody=${encodeURIComponent(templateBody)}`;
}
