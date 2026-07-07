import { describe, expect, it } from "vitest";
import { BillingIngestionService } from "../src/modules/billing-ingestion/billing-ingestion.service.js";
import { InMemoryBillingIngestionRepository } from "../src/modules/billing-ingestion/in-memory-billing-ingestion.repository.js";

describe("BillingIngestionService", () => {
  it("creates cur ingestion jobs", async () => {
    const service = new BillingIngestionService(new InMemoryBillingIngestionRepository());

    const job = await service.createCurJob({
      organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      cloudAccountId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      bucketName: "aws-cur-bucket",
      bucketPrefix: "cur/",
    });

    expect(job.status).toBe("queued");
    expect(job.bucketName).toBe("aws-cur-bucket");
  });
});
