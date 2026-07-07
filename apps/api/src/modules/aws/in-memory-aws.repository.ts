import { randomUUID } from "node:crypto";
import type { AwsConnectionPlan } from "./aws.types.js";

export class InMemoryAwsRepository {
  private readonly plans: AwsConnectionPlan[] = [];

  async create(plan: AwsConnectionPlan) {
    this.plans.push(plan);
    return plan;
  }

  async list(organizationId: string) {
    return this.plans.filter((plan) => plan.organizationId === organizationId);
  }

  async findById(id: string) {
    return this.plans.find((plan) => plan.id === id);
  }

  async markConnected(id: string) {
    const plan = await this.findById(id);

    if (!plan) {
      return undefined;
    }

    plan.status = "connected";
    return plan;
  }

  createConnectionId() {
    return randomUUID();
  }
}
