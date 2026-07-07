const metrics = [
  { label: "Current spend", value: "$25,000", delta: "+8.2%" },
  { label: "Savings realized", value: "$8,420", delta: "+$1,240" },
  { label: "Open findings", value: "18", delta: "4 need approval" },
  { label: "Automated jobs", value: "31", delta: "3 failed" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold">Cloud spend control plane</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
              <p className="mt-2 text-sm text-cyan-300">{metric.delta}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
