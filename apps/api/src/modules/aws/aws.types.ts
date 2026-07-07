export type AwsConnectionRequest = {
  organizationId: string;
  accountId: string;
  organizationName?: string;
  accountAlias?: string;
  curBucketName?: string;
  curBucketPrefix?: string;
  saasPrincipalArn?: string;
};

export type AwsConnectionStatus = "pending" | "connected" | "failed";

export type AwsConnectionPlan = {
  id: string;
  organizationId: string;
  accountId: string;
  accountAlias?: string;
  stackName: string;
  roleName: string;
  externalId: string;
  status: AwsConnectionStatus;
  consoleUrl: string;
  templateBody: string;
  trustPolicy: {
    principalArn: string;
    externalId: string;
  };
  requiredPermissions: string[];
  nextSteps: string[];
  securityNotes: string[];
  createdAt: string;
};
