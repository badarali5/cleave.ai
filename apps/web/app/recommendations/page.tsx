import { RecommendationsClient } from "./recommendations-client.js";

const fallbackRecommendations = [
  { id: "rec-1", title: "Idle EC2 instance", savings: "$124/mo", risk: "Low", confidence: "0.91" },
  { id: "rec-2", title: "Unused EBS volume", savings: "$61/mo", risk: "Low", confidence: "0.88" },
  { id: "rec-3", title: "Oversized RDS instance", savings: "$780/mo", risk: "Medium", confidence: "0.79" },
];

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function fetchRecommendations() {
  try {
    const res = await fetch(`${apiBase}/recommendations`, { cache: "no-store" });
    if (!res.ok) {
      return fallbackRecommendations;
    }
    const data = (await res.json()) as { items: any[] };
    if (!data.items || data.items.length === 0) {
      return fallbackRecommendations;
    }

    return data.items.map((item) => {
      let riskStr = "Low";
      if (item.riskScore1To5 !== undefined) {
        riskStr = `Score ${item.riskScore1To5}/5`;
      } else if (item.riskScore > 0.35) {
        riskStr = "High";
      } else if (item.riskScore > 0.15) {
        riskStr = "Medium";
      }

      return {
        id: item.id,
        title: item.title,
        savings: `$${item.estimatedMonthlySavings}/mo`,
        risk: riskStr,
        confidence: item.confidenceScore.toString(),
        remediationScript: item.remediationScript,
      };
    });
  } catch (error) {
    return fallbackRecommendations;
  }
}

export default async function RecommendationsPage() {
  const items = await fetchRecommendations();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-4xl font-semibold">Recommendations</h1>
        <RecommendationsClient items={items} />
      </div>
    </main>
  );
}
