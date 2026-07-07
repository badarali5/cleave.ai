import { randomUUID } from "node:crypto";
import type { Resource } from "./resource.types.js";

export class InMemoryResourceRepository {
  private readonly resources: Resource[] = [
    {
      id: randomUUID(),
      organizationId: "00000000-0000-0000-0000-000000000000",
      cloudAccountId: null,
      provider: "aws",
      kind: "ec2_instance",
      resourceArn: "arn:aws:ec2:us-east-1:123456789012:instance/i-123456",
      name: "demo-instance",
      region: "us-east-1",
      status: "active",
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  async list(organizationId: string) {
    return this.resources.filter((resource) => resource.organizationId === organizationId);
  }
}
