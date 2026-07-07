import { randomUUID } from "node:crypto";
import type { OrganizationRepository } from "./organization.repository.js";
import type { Organization } from "./organization.types.js";

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly organizations: Organization[] = [];

  async list() {
    return this.organizations;
  }

  async create(input: { name: string; slug: string }) {
    const existing = this.organizations.find((organization) => organization.slug === input.slug);
    if (existing) {
      throw new Error("organization slug already exists");
    }

    const organization: Organization = {
      id: randomUUID(),
      name: input.name,
      slug: input.slug,
      createdAt: new Date().toISOString(),
    };

    this.organizations.push(organization);

    return organization;
  }
}
