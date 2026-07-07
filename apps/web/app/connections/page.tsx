export default function ConnectionsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Onboarding</p>
          <h1 className="text-4xl font-semibold">Cloud Connections</h1>
          <p className="max-w-3xl text-slate-300">
            Connect AWS with a read-only cross-account role first. The platform generates the trust policy, ExternalId, CloudFormation deployment link, and exact permissions required for cost ingestion.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">What the backend generates</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Deterministic role name and stack name.</li>
              <li>Cross-account trust policy with ExternalId protection.</li>
              <li>Read-only permissions for Cost Explorer, CUR, CloudWatch, CloudTrail, Trusted Advisor, and Compute Optimizer.</li>
              <li>Optional CUR bucket access if the customer supplies billing export details.</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
            <h2 className="text-lg font-semibold text-cyan-100">Approval flow</h2>
            <ol className="mt-4 space-y-2 text-sm text-cyan-50/80">
              <li>1. Submit account ID and organization ID.</li>
              <li>2. Review the CloudFormation console link.</li>
              <li>3. Deploy the stack in AWS.</li>
              <li>4. Confirm the connection in the SaaS dashboard.</li>
            </ol>
          </article>
        </section>
      </div>
    </main>
  );
}
