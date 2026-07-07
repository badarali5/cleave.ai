import { describe, expect, it } from "vitest";
import { analyzeCostSignals } from "../src/agents/cost-analysis.agent.js";
import { classifyResource } from "../src/agents/resource-classification.agent.js";

describe("worker agents", () => {
  it("produces cost findings", () => {
    const result = analyzeCostSignals();
    expect(result.findings.length).toBeGreaterThan(0);
  });

  it("classifies idle resources", () => {
    expect(classifyResource({ cpuUtilization: 1, networkBytes: 10 })).toBe("idle");
  });
});
