import { InMemoryLedgerRepository } from "./in-memory-ledger.repository.js";
import { LedgerService } from "./ledger.service.js";

export const ledgerRepository = new InMemoryLedgerRepository();
export const ledgerService = new LedgerService(ledgerRepository);
