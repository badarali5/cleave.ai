import { randomUUID } from "node:crypto";
import type { RemediationPlan } from "./remediation.types.js";

export class InMemoryRemediationRepository {
  private readonly plans: RemediationPlan[] = [];

  async create(plan: Omit<RemediationPlan, "id" | "status" | "approvedAt" | "executedAt" | "rolledBackAt" | "resultMessage" | "createdAt">) {
    const record: RemediationPlan = {
      ...plan,
      id: randomUUID(),
      status: "planned",
      createdAt: new Date().toISOString(),
      approvedAt: null,
      executedAt: null,
      rolledBackAt: null,
      resultMessage: null,
    };

    this.plans.push(record);
    return record;
  }

  async list(organizationId: string) {
    return this.plans.filter((plan) => plan.organizationId === organizationId);
  }

  async findById(id: string) {
    return this.plans.find((plan) => plan.id === id);
  }

  async save(plan: RemediationPlan) {
    const index = this.plans.findIndex((item) => item.id === plan.id);

    if (index >= 0) {
      this.plans[index] = plan;
      return plan;
    }

    this.plans.push(plan);
    return plan;
  }
}
