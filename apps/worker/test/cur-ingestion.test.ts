import { describe, expect, it } from "vitest";
import { runCurIngestion } from "../src/ingestion/cur-ingestion.job.js";

describe("CUR ingestion", () => {
  it("parses and summarizes CUR csv records", () => {
    const csvText = [
      "lineItem_UsageStartDate,product_ProductName,lineItem_UsageType,lineItem_ResourceId,lineItem_UnblendedCost,lineItem_UsageAmount,lineItem_CurrencyCode,resourceTags/Environment",
      "2026-07-01T00:00:00Z,Amazon Elastic Compute Cloud,BoxUsage:i-1234567890abcdef0,i-1234567890abcdef0,120.34,100,USD,staging",
      "2026-07-01T00:00:00Z,Amazon Elastic Block Store,EBS:VolumeUsage,vol-0123456789abcdef0,19.76,200,USD,staging",
    ].join("\n");

    const result = runCurIngestion({
      jobId: "11111111-1111-1111-1111-111111111111",
      organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      sourceType: "csv_upload",
      csvText,
    });

    expect(result.lineItems).toHaveLength(2);
    expect(result.summary.lineItemsParsed).toBe(2);
    expect(result.summary.totalCost).toBe(140.1);
    expect(result.summary.services).toContain("Amazon Elastic Compute Cloud");
  });
});
