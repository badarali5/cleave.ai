import type { OrganizationRepository } from "./organization.repository.js";

export class OrganizationService {
  constructor(private readonly repository: OrganizationRepository) {}

  listOrganizations() {
    return this.repository.list();
  }

  createOrganization(input: { name: string; slug: string }) {
    return this.repository.create(input);
  }
}
