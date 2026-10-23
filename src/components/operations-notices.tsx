"use client";
import { useState } from "react";
import { Card } from "./ui";
import { useSoilLoop } from "@/lib/use-soil-loop";
import { resolveIssue } from "@/lib/store";
import { malaysiaDate } from "@/lib/operations";

export function OperationsNotices() {
  const { state } = useSoilLoop();
  const [error, setError] = useState("");
  const issues = state.champion_issues.filter((i) => !i.resolved_at);
  const latest = state.blocks.flatMap((b) => {
    const c = state.collections.filter((c) => c.block_id === b.block_id).sort((a, b) => b.collection_datetime.localeCompare(a.collection_datetime))[0];
    return c && (c.status !== "completed" || c.contamination_status !== "clean") ? [c] : [];
  });
  const overdue = state.batches.filter((b) => ["received", "composting"].includes(b.batch_status) && b.expected_ready_date < malaysiaDate());
  return <Card className="mt-4 space-y-3"><h2 className="font-display text-xl">Needs attention</h2>
    {!issues.length && !latest.length && !overdue.length ? <p className="text-sm text-soil-500">No open issues or overdue batches.</p> : null}
    {issues.map((i) => <div key={i.issue_id} className="rounded-2xl bg-cream-100 p-3"><p className="text-sm font-semibold">{i.block_id} · {i.kind}</p><p className="mt-1 text-sm">{i.notes}</p><button type="button" className="mt-2 text-xs font-semibold text-leaf-800" onClick={() => { try { resolveIssue(i.issue_id); } catch (err) { setError(err instanceof Error ? err.message : "Could not resolve issue."); } }}>Mark handled</button></div>)}
    {latest.map((c) => <div key={c.collection_id} className="border-l-2 border-clay-500 pl-3"><p className="text-sm font-semibold">{c.block_id} · {c.status === "completed" ? `${c.contamination_status} contamination` : `${c.status} pickup`}</p><p className="text-xs leading-5 text-soil-600">{c.contamination_notes}</p></div>)}
    {overdue.map((b) => <p key={b.batch_id} className="text-sm">{b.batch_id}: expected {b.expected_ready_date}. Review its progress and expected date.</p>)}
    {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : null}
  </Card>;
}
