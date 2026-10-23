"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { createBatch } from "@/lib/store";
import { malaysiaDate } from "@/lib/operations";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function NewBatchPage() {
  const { user, state } = useSoilLoop();
  const router = useRouter();
  const sites = [...new Set(state.blocks.map((b) => b.assigned_compost_site))];
  const [site, setSite] = useState("");
  const [start, setStart] = useState(malaysiaDate);
  const [expected, setExpected] = useState("");
  const [method, setMethod] = useState("Hot composting");
  const [error, setError] = useState("");
  return <Guard user={user} allow={["gardener"]}><PhoneShell><TopBar user={user} title="Start a compost batch" back="/gardener" /><form onSubmit={(e) => {
    e.preventDefault(); setError("");
    try { const batch = createBatch({ compost_site: site || sites[0], start_date: start, expected_ready_date: expected, composting_method: method }); router.push(`/gardener/batch/${batch.batch_id}`); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not create batch."); }
  }}><Card className="space-y-4"><p className="text-sm text-soil-600">Start with an empty batch. Accepted collections build its input weight and source-block list.</p>
    <Field label="Composting partner"><select className={inputClass} value={site || sites[0]} onChange={(e) => setSite(e.target.value)}>{sites.map((s) => <option key={s}>{s}</option>)}</select></Field>
    <Field label="Method"><select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value)}>{["Hot composting", "Cold composting", "Vermicomposting"].map((m) => <option key={m}>{m}</option>)}</select></Field>
    <Field label="Start date"><input className={inputClass} required type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
    <Field label="Expected ready date"><input className={inputClass} required type="date" min={start} value={expected} onChange={(e) => setExpected(e.target.value)} /></Field>
    <p className="text-xs text-soil-500">Your partner sets the expected date. Readiness still requires a recorded quality check.</p>
    {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : null}<PrimaryButton type="submit">Create batch</PrimaryButton>
  </Card></form></PhoneShell></Guard>;
}
