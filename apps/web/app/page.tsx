const cards = [
  { label: "Monthly spend", value: "$25,000" },
  { label: "Potential savings", value: "$4,800" },
  { label: "Open recommendations", value: "18" },
  { label: "Approved remediations", value: "7" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-16 lg:px-10">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Nimbus FinOps</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            AI-native AWS cost optimization with safe, audited remediation.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Connect AWS with cross-account IAM roles, surface waste automatically, rank savings by risk, and approve safe remediations from one control plane.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold">{card.value}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold">Control plane</h2>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>Onboard AWS accounts with least-privilege cross-account roles.</li>
              <li>Detect idle EC2, unattached EBS, unused Elastic IPs, and oversized RDS instances.</li>
              <li>Generate AI explanations, confidence scores, and rollback-aware recommendations.</li>
              <li>Track approvals, executions, and realized savings in one audit trail.</li>
            </ul>
          </section>

          <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
            <h2 className="text-xl font-semibold text-cyan-100">Production-ready foundation</h2>
            <p className="mt-4 text-cyan-50/80">
              This scaffold is organized for clean architecture, background jobs, multi-tenancy, and secure AWS integration.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
