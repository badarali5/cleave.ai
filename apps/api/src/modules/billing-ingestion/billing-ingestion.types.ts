export type CurSourceType = "s3_manifest" | "csv_upload";

export type CurSourceRequest = {
  organizationId: string;
  cloudAccountId: string;
  bucketName?: string;
  bucketPrefix?: string;
  reportName?: string;
  sourceType?: CurSourceType;
};

export type CurIngestionJob = {
  id: string;
  organizationId: string;
  cloudAccountId: string;
  sourceType: CurSourceType;
  bucketName?: string;
  bucketPrefix?: string;
  reportName?: string;
  status: "queued" | "running" | "succeeded" | "failed";
  createdAt: string;
};

export type CurIngestionSummary = {
  jobId: string;
  organizationId: string;
  cloudAccountId: string;
  sourceType: CurSourceType;
  lineItemsParsed: number;
  totalCost: number;
  services: string[];
  completedAt: string;
};
