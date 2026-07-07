import { randomUUID } from "node:crypto";
import type { LedgerEntry } from "./ledger.types.js";

export class InMemoryLedgerRepository {
  private readonly entries: LedgerEntry[] = [];

  async create(input: Omit<LedgerEntry, "id" | "createdAt" | "status" | "reconciledAt"> & { status?: LedgerEntry["status"] }) {
    const entry: LedgerEntry = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: input.status ?? "pending",
      reconciledAt: null,
    };

    this.entries.push(entry);
    return entry;
  }

  async list(organizationId: string) {
    return this.entries.filter((entry) => entry.organizationId === organizationId);
  }

  async reconcile(id: string, input: { actualCost: number; notes?: string }) {
    const entry = this.entries.find((item) => item.id === id);

    if (!entry) {
      return undefined;
    }

    entry.actualCost = input.actualCost;
    entry.deltaSavings = Number((entry.baselineCost - input.actualCost).toFixed(2));
    entry.status = "reconciled";
    entry.reconciledAt = new Date().toISOString();
    entry.notes = input.notes ?? entry.notes;
    return entry;
  }
}
