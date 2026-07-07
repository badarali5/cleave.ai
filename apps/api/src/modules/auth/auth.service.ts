import type { AuthenticatedUser } from "./auth.types.js";

export class AuthService {
  async login(input: { email: string; password: string }): Promise<{ token: string; user: AuthenticatedUser }> {
    if (!input.email.includes("@") || input.password.length < 8) {
      throw new Error("invalid credentials");
    }

    return {
      token: "dev-token",
      user: {
        id: "00000000-0000-0000-0000-000000000001",
        email: input.email,
        name: "Demo User",
        organizationId: "00000000-0000-0000-0000-000000000000",
        role: "owner",
      },
    };
  }
}
