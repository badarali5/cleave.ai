import type { Organization } from "./organization.types.js";

export interface OrganizationRepository {
  list(): Promise<Organization[]>;
  create(input: { name: string; slug: string }): Promise<Organization>;
}
