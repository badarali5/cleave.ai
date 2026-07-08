import { randomUUID } from "node:crypto";
import { classifyResourceWithLLM } from "../agents/resource-classification.agent.js";
import { InMemoryRecommendationRepository } from "../../../api/src/modules/recommendations/in-memory-recommendation.repository.js";
import type { Recommendation } from "../../../api/src/modules/recommendations/recommendation.types.js";

export type PipelineResource = {
  id: string;
  kind: "ec2_instance" | "ebs_volume" | "rds_instance" | string;
  resourceArn: string;
  name?: string;
  metrics: {
    cpuUtilization?: number;
    networkBytes?: number;
    attached?: boolean;
    monthlyCost?: number;
  };
};

export class RecommendationPipelineService {
  private readonly repository = new InMemoryRecommendationRepository();

  async processResources(organizationId: string, cloudAccountId: string, resources: PipelineResource[]) {
    const recommendations: Recommendation[] = [];

    for (const resource of resources) {
      const classification = classifyResourceWithLLM(resource);

      if (classification.status === "active") {
        continue;
      }

      // 1. Compute estimated monthly savings
      let estimatedMonthlySavings = 0;
      const monthlyCost = resource.metrics.monthlyCost ?? 0;

      if (classification.status === "zombie") {
        estimatedMonthlySavings = monthlyCost > 0 ? monthlyCost : 22.50;
      } else if (classification.status === "idle") {
        estimatedMonthlySavings = monthlyCost > 0 ? Number((monthlyCost * 0.6).toFixed(2)) : 74.19;
      } else if (classification.status === "oversized") {
        estimatedMonthlySavings = monthlyCost > 0 ? Number((monthlyCost * 0.35).toFixed(2)) : 150.00;
      }

      // 2. Attach a risk score (1--5)
      let riskScore1To5 = 1;
      let riskScore = 0.1; // fallback float for schema (0-1)

      if (classification.status === "idle") {
        riskScore1To5 = 2;
        riskScore = 0.22;
      } else if (classification.status === "zombie") {
        riskScore1To5 = 1;
        riskScore = 0.14;
      } else if (classification.status === "oversized") {
        riskScore1To5 = 3;
        riskScore = 0.45;
      }

      // 3. Generate automated CLI remediation script snippet
      let remediationScript = "";
      if (resource.kind === "ec2_instance") {
        remediationScript = `aws ec2 stop-instances --instance-ids ${resource.id}`;
      } else if (resource.kind === "ebs_volume") {
        remediationScript = `aws ec2 delete-volume --volume-id ${resource.id}`;
      } else if (resource.kind === "rds_instance") {
        remediationScript = `aws rds modify-db-instance --db-instance-identifier ${resource.id} --db-instance-class db.t4g.micro --apply-immediately`;
      } else {
        remediationScript = `# No automation available for ${resource.kind}`;
      }

      const recommendation: Recommendation = {
        id: randomUUID(),
        organizationId,
        resourceId: resource.id,
        category: classification.status === "idle" ? "idle_ec2" : classification.status === "zombie" ? "unattached_ebs" : "oversized_rds",
        title: `${classification.status.toUpperCase()} ${resource.kind.replace("_", " ").toUpperCase()}: ${resource.name ?? resource.id}`,
        explanation: classification.reason,
        estimatedMonthlySavings,
        confidenceScore: classification.confidence,
        riskScore,
        riskScore1To5,
        remediationScript,
        status: "open",
        createdAt: new Date().toISOString(),
      };

      recommendations.push(recommendation);
    }

    if (recommendations.length > 0) {
      await this.repository.saveMany(recommendations);
      console.log(`[RECOMMENDATION PIPELINE]: Generated and saved ${recommendations.length} recommendations to the database.`);
    }

    return recommendations;
  }
}
