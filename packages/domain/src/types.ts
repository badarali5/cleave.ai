export type UUID = string;

export type CloudProvider = "aws";

export type OrganizationRole = "owner" | "admin" | "engineer" | "finance" | "viewer";

export type RecommendationStatus = "open" | "approved" | "executing" | "executed" | "rejected";

export type RemediationRisk = "low" | "medium" | "high";

export type ResourceKind =
  | "ec2_instance"
  | "ebs_volume"
  | "elastic_ip"
  | "rds_instance"
  | "snapshot"
  | "s3_bucket"
  | "load_balancer"
  | "savings_plan"
  | "reserved_instance";
