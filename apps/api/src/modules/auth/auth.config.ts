export type IdentityProvider = "auth0" | "workos";

export type AuthConfig = {
  provider: IdentityProvider;
  domain: string;
  clientId: string;
  audience?: string;
  callbackUrl?: string;
};

export function loadAuthConfig(): AuthConfig {
  const provider = (process.env.AUTH_PROVIDER ?? "auth0") as IdentityProvider;

  if (provider !== "auth0" && provider !== "workos") {
    throw new Error("AUTH_PROVIDER must be auth0 or workos");
  }

  return {
    provider,
    domain: process.env.AUTH_DOMAIN ?? "auth.example.com",
    clientId: process.env.AUTH_CLIENT_ID ?? "demo-client-id",
    audience: process.env.AUTH_AUDIENCE,
    callbackUrl: process.env.AUTH_CALLBACK_URL,
  };
}
