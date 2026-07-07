export type Resource = {
  id: string;
  organizationId: string;
  cloudAccountId: string | null;
  provider: "aws";
  kind: string;
  resourceArn: string;
  name: string | null;
  region: string | null;
  status: string;
  lastSeenAt: string | null;
  createdAt: string;
};
