import type { OrganizationRole } from "../auth/auth.types.js";

export type Permission =
  | "organization:read"
  | "organization:write"
  | "recommendation:approve"
  | "recommendation:execute"
  | "audit:read"
  | "report:read"
  | "aws:connect";

const permissionsByRole: Record<OrganizationRole, Permission[]> = {
  owner: ["organization:read", "organization:write", "recommendation:approve", "recommendation:execute", "audit:read", "report:read", "aws:connect"],
  admin: ["organization:read", "organization:write", "recommendation:approve", "recommendation:execute", "audit:read", "report:read", "aws:connect"],
  engineer: ["organization:read", "recommendation:approve", "recommendation:execute", "audit:read", "report:read", "aws:connect"],
  finance: ["organization:read", "audit:read", "report:read"],
  viewer: ["organization:read", "audit:read", "report:read"],
};

export function hasPermission(role: OrganizationRole, permission: Permission) {
  const permissions = permissionsByRole[role];
  return Boolean(permissions?.includes(permission));
}
