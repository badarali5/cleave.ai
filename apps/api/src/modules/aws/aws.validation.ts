import type { AwsConnectionPlan } from "./aws.types.js";

export type AwsValidationResult = {
  planId: string;
  verified: boolean;
  reason: string;
  assumeRoleRequest: {
    roleArn: string;
    externalId: string;
    sessionName: string;
  };
  validatedAt: string;
};

export function validateAssumeRoleInput(input: {
  plan: AwsConnectionPlan;
  roleArn: string;
  externalId: string;
}): AwsValidationResult {
  const roleArnPattern = /^arn:aws:iam::[0-9]{12}:role\/.+$/;
  const roleArnMatches = roleArnPattern.test(input.roleArn);
  const externalIdMatches = input.externalId === input.plan.externalId;

  return {
    planId: input.plan.id,
    verified: roleArnMatches && externalIdMatches,
    reason: roleArnMatches ? (externalIdMatches ? "assume role input verified" : "externalId mismatch") : "roleArn is invalid",
    assumeRoleRequest: {
      roleArn: input.roleArn,
      externalId: input.externalId,
      sessionName: `nimbus-finops-${input.plan.accountId}`,
    },
    validatedAt: new Date().toISOString(),
  };
}
