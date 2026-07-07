import { normalizeCurRecord, parseCurCsv, summarizeCurRecords, type CurNormalizedRecord } from "./cur-parser.js";

export type CurIngestionInput = {
  jobId: string;
  organizationId: string;
  cloudAccountId: string;
  sourceType: "s3_manifest" | "csv_upload";
  csvText: string;
};

export type CurIngestionResult = {
  jobId: string;
  organizationId: string;
  cloudAccountId: string;
  sourceType: "s3_manifest" | "csv_upload";
  lineItems: CurNormalizedRecord[];
  summary: {
    lineItemsParsed: number;
    totalCost: number;
    services: string[];
  };
};

export function runCurIngestion(input: CurIngestionInput): CurIngestionResult {
  const rawRecords = parseCurCsv(input.csvText);
  const lineItems = rawRecords.map((record) => normalizeCurRecord(record));
  const summary = summarizeCurRecords(lineItems);

  return {
    jobId: input.jobId,
    organizationId: input.organizationId,
    cloudAccountId: input.cloudAccountId,
    sourceType: input.sourceType,
    lineItems,
    summary,
  };
}
