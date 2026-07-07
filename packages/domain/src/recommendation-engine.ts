import { randomUUID } from "node:crypto";
import type { ResourceKind } from "./types.js";

export type RecommendationInputResource = {
  id: string;
  organizationId: string;
  cloudAccountId: string | null;
  kind: ResourceKind | string;
  resourceArn: string;
  name?: string | null;
  region?: string | null;
  status?: string;
  metrics?: {
    cpuUtilization?: number;
    networkBytes?: number;
    attached?: boolean;
    ageDays?: number;
    monthlyCost?: number;
    objectAgeDays?: number;
  };
};

export type RecommendationInputBillingSummary = {
  jobId?: string;
  organizationId: string;
  cloudAccountId: string;
  lineItemsParsed: number;
  totalCost: number;
  services: string[];
};

export type RecommendationGenerated = {
  id: string;
  organizationId: string;
  resourceId: string | null;
  category: string;
  title: string;
  explanation: string;
  estimatedMonthlySavings: number;
  confidenceScore: number;
  riskScore: number;
  status: "open" | "approved" | "executing" | "executed" | "rejected";
  createdAt: string;
};

export type RecommendationGenerationInput = {
  organizationId: string;
  cloudAccountId: string;
  billingSummary: RecommendationInputBillingSummary;
  resources: RecommendationInputResource[];
};

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildRecommendation(input: Omit<RecommendationGenerated, "id" | "createdAt" | "status">): RecommendationGenerated {
  return {
    id: randomUUID(),
    status: "open",
    createdAt: new Date().toISOString(),
    ...input,
  };
}

function estimateMonthlyCost(resource: RecommendationInputResource, billingSummary: RecommendationInputBillingSummary, fallbackRatio: number) {
  const resourceCost = resource.metrics?.monthlyCost;
  if (typeof resourceCost === "number" && resourceCost > 0) {
    return resourceCost;
  }

  const estimatedShare = billingSummary.totalCost * fallbackRatio;
  return estimatedShare > 0 ? estimatedShare : 0;
}

export function generateRecommendations(input: RecommendationGenerationInput) {
  const recommendations: RecommendationGenerated[] = [];
  const services = new Set(input.billingSummary.services.map((service) => service.toLowerCase()));

  for (const resource of input.resources) {
    const metrics = resource.metrics ?? {};
    const cpuUtilization = metrics.cpuUtilization ?? 100;
    const networkBytes = metrics.networkBytes ?? Number.POSITIVE_INFINITY;
    const isAttached = metrics.attached ?? true;
    const ageDays = metrics.ageDays ?? 0;
    const objectAgeDays = metrics.objectAgeDays ?? 0;

    if (resource.kind === "ec2_instance" && cpuUtilization <= 5 && networkBytes <= 1000) {
      const monthlyCost = estimateMonthlyCost(resource, input.billingSummary, 0.06);
      recommendations.push(
        buildRecommendation({
          organizationId: input.organizationId,
          resourceId: resource.id,
          category: "idle_ec2",
          title: `Idle EC2 instance: ${resource.name ?? resource.resourceArn}`,
          explanation: "The instance has sustained low CPU and network activity over the observation window.",
          estimatedMonthlySavings: roundMoney(monthlyCost * 0.55),
          confidenceScore: clamp(0.92 - (cpuUtilization / 1000), 0.78, 0.97),
          riskScore: 0.18,
        }),
      );
      continue;
    }

    if (resource.kind === "ebs_volume" && isAttached === false) {
      const monthlyCost = estimateMonthlyCost(resource, input.billingSummary, 0.01);
      recommendations.push(
        buildRecommendation({
          organizationId: input.organizationId,
          resourceId: resource.id,
          category: "unattached_ebs",
          title: `Unattached EBS volume: ${resource.name ?? resource.resourceArn}`,
          explanation: "The volume is not attached to any instance and can be cleaned up after snapshot review.",
          estimatedMonthlySavings: roundMoney(Math.max(monthlyCost, 10)),
          confidenceScore: 0.97,
          riskScore: 0.14,
        }),
      );
      continue;
    }

    if (resource.kind === "elastic_ip" && isAttached === false) {
      recommendations.push(
        buildRecommendation({
          organizationId: input.organizationId,
          resourceId: resource.id,
          category: "orphaned_elastic_ip",
          title: `Unused Elastic IP: ${resource.name ?? resource.resourceArn}`,
          explanation: "The Elastic IP is allocated but not attached to a running resource.",
          estimatedMonthlySavings: 3.6,
          confidenceScore: 0.99,
          riskScore: 0.05,
        }),
      );
      continue;
    }

    if (resource.kind === "rds_instance" && cpuUtilization <= 20) {
      const monthlyCost = estimateMonthlyCost(resource, input.billingSummary, 0.22);
      recommendations.push(
        buildRecommendation({
          organizationId: input.organizationId,
          resourceId: resource.id,
          category: "oversized_rds",
          title: `Oversized RDS instance: ${resource.name ?? resource.resourceArn}`,
          explanation: "The database shows low utilization and should be reviewed for rightsizing.",
          estimatedMonthlySavings: roundMoney(monthlyCost * 0.35),
          confidenceScore: clamp(0.84 + (20 - cpuUtilization) / 200, 0.72, 0.94),
          riskScore: 0.36,
        }),
      );
      continue;
    }

    if (resource.kind === "snapshot" && ageDays >= 30) {
      const monthlyCost = estimateMonthlyCost(resource, input.billingSummary, 0.004);
      recommendations.push(
        buildRecommendation({
          organizationId: input.organizationId,
          resourceId: resource.id,
          category: "orphaned_snapshot",
          title: `Stale snapshot: ${resource.name ?? resource.resourceArn}`,
          explanation: "The snapshot is older than the default retention threshold and should be validated for deletion.",
          estimatedMonthlySavings: roundMoney(Math.max(monthlyCost, 12)),
          confidenceScore: clamp(0.88 + (ageDays / 1000), 0.82, 0.96),
          riskScore: 0.12,
        }),
      );
      continue;
    }

    if (resource.kind === "s3_bucket" && objectAgeDays >= 90) {
      const monthlyCost = estimateMonthlyCost(resource, input.billingSummary, 0.04);
      recommendations.push(
        buildRecommendation({
          organizationId: input.organizationId,
          resourceId: resource.id,
          category: "s3_lifecycle_policy",
          title: `S3 lifecycle policy opportunity: ${resource.name ?? resource.resourceArn}`,
          explanation: "Older objects appear to be retained without an active lifecycle policy.",
          estimatedMonthlySavings: roundMoney(monthlyCost * 0.22),
          confidenceScore: 0.82,
          riskScore: 0.24,
        }),
      );
      continue;
    }
  }

  if (input.billingSummary.totalCost >= 10000 && (services.has("amazon elastic compute cloud") || services.has("amazon relational database service"))) {
    recommendations.push(
      buildRecommendation({
        organizationId: input.organizationId,
        resourceId: null,
        category: "commitment_review",
        title: "Review Savings Plans and Reserved Instances",
        explanation: "Monthly spend is high enough that commitment-based discounts are likely worth modeling.",
        estimatedMonthlySavings: roundMoney(input.billingSummary.totalCost * 0.08),
        confidenceScore: 0.74,
        riskScore: 0.28,
      }),
    );
  }

  if (recommendations.length === 0 && input.billingSummary.totalCost >= 1000) {
    recommendations.push(
      buildRecommendation({
        organizationId: input.organizationId,
        resourceId: null,
        category: "tagging_gap",
        title: "Tagging and ownership gap detected",
        explanation: "The billing profile suggests missing ownership context, which slows safe remediation and prioritization.",
        estimatedMonthlySavings: roundMoney(input.billingSummary.totalCost * 0.03),
        confidenceScore: 0.63,
        riskScore: 0.1,
      }),
    );
  }

  return recommendations.sort((left, right) => right.estimatedMonthlySavings - left.estimatedMonthlySavings);
}
