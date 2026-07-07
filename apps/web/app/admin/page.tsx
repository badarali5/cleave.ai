export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-4xl font-semibold">Admin</h1>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-slate-300">Review audit logs, system health, model usage, and tenant-level access settings.</p>
        </section>
      </div>
    </main>
  );
}
