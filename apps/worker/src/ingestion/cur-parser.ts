import { parse } from "csv-parse/sync";

export type CurRawRecord = Record<string, string>;

export type CurNormalizedRecord = {
  usageDate: string;
  service: string;
  usageType: string;
  resourceArn: string | null;
  cost: number;
  usageQuantity: number;
  currency: string;
  tags: Record<string, string>;
};

function toNumber(value: string | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractTags(record: CurRawRecord) {
  const tags: Record<string, string> = {};

  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith("resourceTags/") || key.startsWith("tag:")) {
      const tagKey = key.replace(/^resourceTags\//, "").replace(/^tag:/, "");
      if (value) {
        tags[tagKey] = value;
      }
    }
  }

  return tags;
}

export function parseCurCsv(csvText: string): CurRawRecord[] {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CurRawRecord[];
}

export function normalizeCurRecord(record: CurRawRecord): CurNormalizedRecord {
  return {
    usageDate: record.lineItem_UsageStartDate ?? record.usageStartDate ?? new Date().toISOString(),
    service: record.product_ProductName ?? record.lineItem_ProductCode ?? "unknown",
    usageType: record.lineItem_UsageType ?? "unknown",
    resourceArn: record.lineItem_ResourceId || record.resourceArn || null,
    cost: toNumber(record.lineItem_UnblendedCost ?? record.lineItem_BlendedCost),
    usageQuantity: toNumber(record.lineItem_UsageAmount),
    currency: record.lineItem_CurrencyCode ?? "USD",
    tags: extractTags(record),
  };
}

export function summarizeCurRecords(records: CurNormalizedRecord[]) {
  const services = new Set<string>();
  let totalCost = 0;

  for (const record of records) {
    services.add(record.service);
    totalCost += record.cost;
  }

  return {
    lineItemsParsed: records.length,
    totalCost: Number(totalCost.toFixed(2)),
    services: Array.from(services).sort(),
  };
}
