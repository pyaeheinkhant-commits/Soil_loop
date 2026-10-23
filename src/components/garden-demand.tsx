"use client";
import { useState } from "react";
import { Card, Field, GhostLink, PrimaryButton, inputClass } from "./ui";
import { useSoilLoop } from "@/lib/use-soil-loop";
import { requestCompost } from "@/lib/store";
import { availableKg } from "@/lib/operations";

export function GardenDemand({ editable = false }: { editable?: boolean }) {
  const { state, user } = useSoilLoop();
  const gardens = state.gardens.filter((g) => g.gardener_id === user?.user_id);
  const [gardenId, setGardenId] = useState("");
  const [kg, setKg] = useState("");
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const supply = state.batches.filter((b) => b.batch_status === "ready" && b.quality_status === "passed").reduce((sum, b) => sum + availableKg(state, b.batch_id), 0);
  return <Card className="mt-4 space-y-3"><h2 className="font-display text-xl">Garden demand</h2><p className="text-sm text-soil-600">{supply} kg of quality-passed compost available.</p>
    {state.compost_requests.length ? state.compost_requests.map((r) => {
      const used = state.compost_uses.filter((u) => u.request_id === r.request_id).reduce((sum, u) => sum + u.compost_used_kg, 0);
      const remaining = Math.max(0, r.requested_kg - used);
      return <div key={r.request_id} className="rounded-2xl bg-cream-50 p-3"><p className="text-sm font-semibold">{state.gardens.find((g) => g.garden_id === r.garden_id)?.garden_name}</p><p className="text-sm">{r.purpose}</p><p className="mt-1 text-xs text-soil-600">{r.requested_kg} kg requested · {remaining ? `${remaining} kg outstanding` : "Fulfilled"} · Needed {r.needed_by}</p></div>;
    }) : <p className="text-sm text-soil-500">No garden requests yet.</p>}
    {editable && gardens.length ? <details><summary className="cursor-pointer text-sm font-semibold text-leaf-800">Request compost for a garden</summary><form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); try { requestCompost({ garden_id: gardenId || gardens[0].garden_id, requested_kg: Number(kg), needed_by: date, purpose }); setMessage("Request saved. The operator can see the outstanding demand."); setKg(""); setPurpose(""); } catch (err) { setMessage(err instanceof Error ? err.message : "Could not save request."); } }}>
      <Field label="Garden"><select className={inputClass} value={gardenId || gardens[0].garden_id} onChange={(e) => setGardenId(e.target.value)}>{gardens.map((g) => <option key={g.garden_id} value={g.garden_id}>{g.garden_name}</option>)}</select></Field>
      <Field label="Requested compost (kg)"><input required type="number" min="0.001" step="0.001" className={inputClass} value={kg} onChange={(e) => setKg(e.target.value)} /></Field>
      <Field label="Needed by"><input required type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Purpose"><input required className={inputClass} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Prepare the new herb beds" /></Field>
      <PrimaryButton type="submit">Save request</PrimaryButton><p role="status" className="text-xs">{message}</p>
    </form></details> : null}
    {editable ? <GhostLink href="/gardener/use">Record compost use / fulfil a request</GhostLink> : null}
  </Card>;
}
