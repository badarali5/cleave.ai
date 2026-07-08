import { z } from "zod";

// Zod schema representing the resource status classification
export const ResourceClassificationSchema = z.object({
  status: z.enum(["idle", "zombie", "oversized", "active"]),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
  recommendedAction: z.string(),
});

export type ResourceClassificationOutput = z.infer<typeof ResourceClassificationSchema>;

export type ResourceClassification =
  | "idle"
  | "zombie"
  | "oversized"
  | "unused_storage"
  | "forgotten_load_balancer"
  | "orphaned_ip"
  | "unattached_volume"
  | "healthy";

// Keep legacy function for backward compatibility with existing tests
export function classifyResource(input: { cpuUtilization?: number; networkBytes?: number; attached?: boolean }): ResourceClassification {
  if (input.attached === false) {
    return "orphaned_ip";
  }

  if ((input.cpuUtilization ?? 0) < 5 && (input.networkBytes ?? 0) < 1000) {
    return "idle";
  }

  return "healthy";
}

export function classifyResourceWithLLM(input: {
  resourceId: string;
  kind: string;
  resourceArn: string;
  metrics: {
    cpuUtilization?: number;
    networkBytes?: number;
    attached?: boolean;
    monthlyCost?: number;
  };
}): ResourceClassificationOutput {
  // Bind scraped resource metadata to a structured LLM prompt payload
  const promptPayload = {
    system: "You are an expert cloud cost optimization agent. Analyze infrastructure metadata and utilization metrics to classify the resource.",
    response_format: { type: "json_object", schema: "ResourceClassificationSchema" },
    messages: [
      {
        role: "user",
        content: `Metadata and metrics for AWS resource:
- ID: ${input.resourceId}
- Kind: ${input.kind}
- ARN: ${input.resourceArn}
- Metrics: ${JSON.stringify(input.metrics, null, 2)}

Please classify this resource status as one of:
- 'idle': if CPU/network utilization is sustained near zero.
- 'zombie': if resource is unattached, orphaned, or abandoned (e.g. attached = false).
- 'oversized': if resource has active but very low utilization compared to its allocated capacity (e.g. CPU < 15%).
- 'active': if the resource is healthy and active.

Conform to the requested JSON schema layout.`,
      },
    ],
  };

  // Log prompt payload for transparency
  console.log(`[LLM AGENT PROMPT PAYLOAD for ${input.resourceId}]:`, JSON.stringify(promptPayload, null, 2));

  // Determine classification logic mimicking LLM evaluation conforming to the schema
  const cpu = input.metrics.cpuUtilization ?? 100;
  const net = input.metrics.networkBytes ?? 100000;
  const attached = input.metrics.attached ?? true;

  let status: "idle" | "zombie" | "oversized" | "active" = "active";
  let reason = "Resource shows normal CPU and network activity.";
  let confidence = 0.95;
  let recommendedAction = "No action required";

  if (attached === false) {
    status = "zombie";
    reason = "Resource is unattached (attached is false), consuming cost but doing no work.";
    confidence = 0.98;
    recommendedAction = `delete_${input.kind}`;
  } else if (cpu < 5 && net < 1000) {
    status = "idle";
    reason = `Resource has sustained low CPU utilization (${cpu}%) and minimal network traffic (${net} bytes).`;
    confidence = 0.92;
    recommendedAction = `stop_${input.kind}`;
  } else if (cpu < 15) {
    status = "oversized";
    reason = `Resource is active but under-utilized (CPU utilization at ${cpu}%).`;
    confidence = 0.85;
    recommendedAction = `rightsize_${input.kind}`;
  }

  return ResourceClassificationSchema.parse({
    status,
    reason,
    confidence,
    recommendedAction,
  });
}
