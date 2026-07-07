const recommendations = [
  { title: "Idle EC2 instance", savings: "$124/mo", risk: "Low", confidence: "0.91" },
  { title: "Unused EBS volume", savings: "$61/mo", risk: "Low", confidence: "0.88" },
  { title: "Oversized RDS instance", savings: "$780/mo", risk: "Medium", confidence: "0.79" },
];

export default function RecommendationsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-4xl font-semibold">Recommendations</h1>
        <div className="space-y-4">
          {recommendations.map((item) => (
            <article key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium">{item.title}</h2>
                  <p className="mt-2 text-slate-300">Estimated savings {item.savings}</p>
                </div>
                <div className="text-sm text-slate-300">
                  <p>Risk: {item.risk}</p>
                  <p>Confidence: {item.confidence}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
