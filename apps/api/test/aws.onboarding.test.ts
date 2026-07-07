import { describe, expect, it } from "vitest";
import { AwsOnboardingService } from "../src/modules/aws/aws.service.js";

describe("AwsOnboardingService", () => {
  it("creates a secure onboarding plan with CloudFormation and ExternalId", () => {
    const service = new AwsOnboardingService();

    const plan = service.createOnboardingPlan({
      organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      accountId: "123456789012",
      accountAlias: "production",
      curBucketName: "aws-cur-bucket",
      curBucketPrefix: "cur/",
    });

    expect(plan.accountId).toBe("123456789012");
    expect(plan.externalId).toHaveLength(36);
    expect(plan.consoleUrl).toContain("cloudformation");
    expect(plan.templateBody).toContain("NimbusFinOpsReadOnly");
    expect(plan.templateBody).toContain("sts:AssumeRole");
    expect(plan.templateBody).toContain("s3:GetObject");
  });

  it("rejects invalid AWS account ids", () => {
    const service = new AwsOnboardingService();

    expect(() =>
      service.createOnboardingPlan({
        organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        accountId: "bad-id",
      }),
    ).toThrow("accountId must be a 12-digit AWS account ID");
  });
});
