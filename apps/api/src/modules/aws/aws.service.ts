import { InMemoryAwsRepository } from "./in-memory-aws.repository.js";
import {
  buildCloudFormationConsoleUrl,
  buildCloudFormationTemplate,
  buildRequiredPermissions,
  buildRoleName,
  buildStackName,
} from "./aws.template.js";
import type { AwsConnectionPlan, AwsConnectionRequest } from "./aws.types.js";

const defaultPrincipalArn = process.env.AWS_SAAS_PRINCIPAL_ARN ?? "arn:aws:iam::123456789012:role/NimbusFinOpsBackendRole";

export class AwsOnboardingService {
  constructor(private readonly repository = new InMemoryAwsRepository()) {}

  private validateAccountId(accountId: string) {
    if (!/^[0-9]{12}$/.test(accountId)) {
      throw new Error("accountId must be a 12-digit AWS account ID");
    }
  }

  createOnboardingPlan(input: AwsConnectionRequest): AwsConnectionPlan {
    this.validateAccountId(input.accountId);

    const id = this.repository.createConnectionId();
    const externalId = id;
    const roleName = buildRoleName(input.accountId);
    const stackName = buildStackName(input.organizationId, input.accountId);
    const principalArn = input.saasPrincipalArn ?? defaultPrincipalArn;
    const templateBody = buildCloudFormationTemplate({
      roleName,
      principalArn,
      externalId,
      ...(input.curBucketName ? { curBucketName: input.curBucketName } : {}),
      ...(input.curBucketPrefix ? { curBucketPrefix: input.curBucketPrefix } : {}),
    });

    const planBase: AwsConnectionPlan = {
      id,
      organizationId: input.organizationId,
      accountId: input.accountId,
      stackName,
      roleName,
      externalId,
      status: "pending",
      consoleUrl: buildCloudFormationConsoleUrl(stackName, templateBody),
      templateBody,
      trustPolicy: {
        principalArn,
        externalId,
      },
      requiredPermissions: buildRequiredPermissions(),
      nextSteps: [
        "Open the CloudFormation console URL.",
        "Review the generated read-only role and trust policy.",
        "Deploy the stack into the target AWS account.",
        "Copy the resulting IAM role ARN back into the SaaS account record.",
        "Connect the CUR bucket if the account uses consolidated billing exports.",
      ],
      securityNotes: [
        "The trust relationship requires a matching ExternalId to prevent confused-deputy attacks.",
        "The generated role is read-only in phase 1 and cannot delete or mutate customer resources.",
        "Write permissions are intentionally excluded until approval-based remediation is enabled.",
      ],
      createdAt: new Date().toISOString(),
    };

    const plan: AwsConnectionPlan = input.accountAlias
      ? { ...planBase, accountAlias: input.accountAlias }
      : planBase;

    void this.repository.create(plan);

    return plan;
  }

  listPlans(organizationId: string) {
    return this.repository.list(organizationId);
  }

  confirmConnection(planId: string) {
    return this.repository.markConnected(planId);
  }
}

