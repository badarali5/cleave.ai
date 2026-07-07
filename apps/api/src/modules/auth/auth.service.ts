import { loadAuthConfig } from "./auth.config.js";
import type { AuthenticatedUser } from "./auth.types.js";
import type { OrganizationService } from "../organizations/organization.service.js";

export type OrganizationRegistrationResult = {
  organizationId: string;
  organizationName: string;
  slug: string;
  partitionVerified: boolean;
  authProvider: "auth0" | "workos";
};

export class AuthService {
  constructor(private readonly organizationService: OrganizationService) {}

  getProviderConfig() {
    return loadAuthConfig();
  }

  async login(input: { email: string; password: string }): Promise<{ token: string; user: AuthenticatedUser }> {
    if (!input.email.includes("@") || input.password.length < 8) {
      throw new Error("invalid credentials");
    }

    const authConfig = this.getProviderConfig();

    return {
      token: `dev-token-${authConfig.provider}`,
      user: {
        id: "00000000-0000-0000-0000-000000000001",
        email: input.email,
        name: "Demo User",
        organizationId: "00000000-0000-0000-0000-000000000000",
        role: "owner",
      },
    };
  }

  async registerOrganization(input: { name: string; slug: string }) {
    const organization = await this.organizationService.createOrganization(input);

    const result: OrganizationRegistrationResult = {
      organizationId: organization.id,
      organizationName: organization.name,
      slug: organization.slug,
      partitionVerified: organization.slug.trim().length > 0,
      authProvider: this.getProviderConfig().provider,
    };

    return result;
  }
}
