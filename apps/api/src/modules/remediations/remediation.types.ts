export type RemediationStatus = "planned" | "approved" | "executing" | "succeeded" | "failed" | "rolled_back";

export type RemediationActionType =
  | "stop_ec2"
  | "schedule_ec2"
  | "resize_ec2"
  | "delete_snapshot"
  | "remove_elastic_ip"
  | "update_s3_lifecycle_policy"
  | "rightsize_rds"
  | "review_commitment_purchase";

export type RemediationPlan = {
  id: string;
  organizationId: string;
  recommendationId: string;
  resourceId: string | null;
  actionType: RemediationActionType;
  title: string;
  description: string;
  status: RemediationStatus;
  requiresApproval: boolean;
  rollbackAvailable: boolean;
  riskScore: number;
  confidenceScore: number;
  estimatedMonthlySavings: number;
  preflightChecks: string[];
  executionSteps: string[];
  rollbackSteps: string[];
  safetyNotes: string[];
  createdAt: string;
  approvedAt: string | null;
  executedAt: string | null;
  rolledBackAt: string | null;
  resultMessage: string | null;
};
