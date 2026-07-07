import { z } from "zod";

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(80),
  createdAt: z.string().datetime(),
});

export const awsIntegrationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  accountId: z.string().regex(/^[0-9]{12}$/),
  externalId: z.string().min(8),
  roleArn: z.string().min(20),
  status: z.enum(["pending", "connected", "error", "disabled"]),
  createdAt: z.string().datetime(),
});

export const awsConnectionRequestSchema = z.object({
  organizationId: z.string().uuid(),
  accountId: z.string().regex(/^[0-9]{12}$/),
  accountAlias: z.string().min(1).max(128).optional(),
  curBucketName: z.string().min(3).max(63).optional(),
  curBucketPrefix: z.string().min(1).max(1024).optional(),
  saasPrincipalArn: z.string().min(20).optional(),
});

export const awsConnectionPlanSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  accountId: z.string().regex(/^[0-9]{12}$/),
  accountAlias: z.string().optional(),
  stackName: z.string().min(3),
  roleName: z.string().min(3),
  externalId: z.string().min(8),
  status: z.enum(["pending", "connected", "failed"]),
  consoleUrl: z.string().url(),
  templateBody: z.string().min(1),
  trustPolicy: z.object({
    principalArn: z.string().min(20),
    externalId: z.string().min(8),
  }),
  requiredPermissions: z.array(z.string().min(3)),
  nextSteps: z.array(z.string().min(3)),
  securityNotes: z.array(z.string().min(3)),
  createdAt: z.string().datetime(),
});

export const curSourceSchema = z.object({
  organizationId: z.string().uuid(),
  cloudAccountId: z.string().uuid(),
  bucketName: z.string().min(3).max(63),
  bucketPrefix: z.string().min(1).max(1024).optional(),
  reportName: z.string().min(1).max(200).optional(),
});

export const curIngestionJobSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  cloudAccountId: z.string().uuid(),
  sourceType: z.enum(["s3_manifest", "csv_upload"]),
  bucketName: z.string().min(3).max(63).optional(),
  bucketPrefix: z.string().min(1).max(1024).optional(),
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  createdAt: z.string().datetime(),
});

export const curLineItemSchema = z.object({
  organizationId: z.string().uuid(),
  cloudAccountId: z.string().uuid(),
  resourceId: z.string().uuid().nullable(),
  usageDate: z.string().datetime(),
  service: z.string().min(1),
  usageType: z.string().min(1),
  resourceArn: z.string().optional(),
  cost: z.number().nonnegative(),
  usageQuantity: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  tags: z.record(z.string()).default({}),
});

export const curIngestionSummarySchema = z.object({
  jobId: z.string().uuid(),
  organizationId: z.string().uuid(),
  cloudAccountId: z.string().uuid(),
  sourceType: z.enum(["s3_manifest", "csv_upload"]),
  lineItemsParsed: z.number().int().nonnegative(),
  totalCost: z.number().nonnegative(),
  services: z.array(z.string()),
  completedAt: z.string().datetime(),
});

export const recommendationSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  resourceId: z.string().uuid().nullable(),
  category: z.string().min(2),
  title: z.string().min(3),
  explanation: z.string().min(10),
  estimatedMonthlySavings: z.number().nonnegative(),
  confidenceScore: z.number().min(0).max(1),
  riskScore: z.number().min(0).max(1),
  status: z.enum(["open", "approved", "executing", "executed", "rejected"]),
  createdAt: z.string().datetime(),
});

export const remediationJobSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  recommendationId: z.string().uuid(),
  actionType: z.string().min(2),
  status: z.enum(["queued", "running", "succeeded", "failed", "rolled_back"]),
  approvedBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});
