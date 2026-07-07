import { AuthService } from "./auth.service.js";
import { OrganizationService } from "../organizations/organization.service.js";
import { InMemoryOrganizationRepository } from "../organizations/in-memory-organization.repository.js";

export const organizationRepository = new InMemoryOrganizationRepository();
export const organizationService = new OrganizationService(organizationRepository);
export const authService = new AuthService(organizationService);
