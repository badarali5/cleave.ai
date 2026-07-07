export type ResourceClassification =
  | "idle"
  | "zombie"
  | "oversized"
  | "unused_storage"
  | "forgotten_load_balancer"
  | "orphaned_ip"
  | "unattached_volume"
  | "healthy";

export function classifyResource(input: { cpuUtilization?: number; networkBytes?: number; attached?: boolean }): ResourceClassification {
  if (input.attached === false) {
    return "orphaned_ip";
  }

  if ((input.cpuUtilization ?? 0) < 5 && (input.networkBytes ?? 0) < 1000) {
    return "idle";
  }

  return "healthy";
}
