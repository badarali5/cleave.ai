"use client";

import { useState } from "react";

type RecommendationCard = {
  id: string;
  title: string;
  savings: string;
  risk: string;
  confidence: string;
  remediationScript?: string;
};

const recommendationApiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export function RecommendationsClient({ items }: { items: RecommendationCard[] }) {
  const [message, setMessage] = useState<string | null>(null);

  async function submitAction(id: string, action: "approve" | "reject" | "execute") {
    setMessage(null);
    try {
      const response = await fetch(`${recommendationApiBase}/recommendations/${id}/${action}`, { method: "POST" });

      if (!response.ok) {
        setMessage(`Action failed for ${id}`);
        return;
      }

      if (action === "execute") {
        setMessage(`Remediation job triggered and enqueued successfully for recommendation ${id}`);
      } else {
        setMessage(`Recommendation successfully ${action}d.`);
      }
    } catch (e) {
      setMessage(`Network error: Action failed for ${id}`);
    }
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-2xl border border-cyan-400/30 bg-cyan-950/40 px-4 py-3 text-sm text-cyan-200 backdrop-blur-md transition-all">
          {message}
        </p>
      ) : null}
      {items.map((item) => (
        <article key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:border-white/15">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium text-slate-100">{item.title}</h2>
              <p className="mt-2 text-emerald-400 font-semibold">Estimated savings: {item.savings}</p>
            </div>
            <div className="text-sm text-slate-300">
              <p>Risk: <span className="font-semibold text-slate-100">{item.risk}</span></p>
              <p>Confidence: <span className="font-semibold text-slate-100">{item.confidence}</span></p>
            </div>
          </div>

          {item.remediationScript && (
            <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Remediation Automation CLI Snippet</p>
              <pre className="mt-2 block w-full overflow-x-auto text-xs font-mono text-cyan-300">
                <code>{item.remediationScript}</code>
              </pre>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => submitAction(item.id, "approve")}
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-95"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => submitAction(item.id, "execute")}
              className="rounded-full border border-cyan-400/40 bg-cyan-950/20 px-5 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100 active:scale-95"
            >
              Execute
            </button>
            <button
              type="button"
              onClick={() => submitAction(item.id, "reject")}
              className="rounded-full border border-rose-400/40 bg-rose-950/20 px-5 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100 active:scale-95"
            >
              Dismiss
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
