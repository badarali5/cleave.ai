export type OrganizationRole = "owner" | "admin" | "engineer" | "finance" | "viewer";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: OrganizationRole;
};
