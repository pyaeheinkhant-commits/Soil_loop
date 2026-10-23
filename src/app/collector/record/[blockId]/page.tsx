"use client";
import { use, useState } from "react";
import { Card, Field, GhostLink, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { PhotoInput } from "@/components/real-media";
import { LoopDiagram } from "@/components/visuals";
import { addCollection } from "@/lib/store";
import { malaysiaDateTime } from "@/lib/operations";
import { useSoilLoop } from "@/lib/use-soil-loop";
import type { CollectionStatus, ContaminationStatus, WeightMethod } from "@/lib/types";

export default function RecordCollectionPage({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = use(params);
  const { user, state } = useSoilLoop();
  const block = state.blocks.find((b) => b.block_id === blockId);
  const bin = state.bins.find((b) => b.block_id === blockId);
  const batches = state.batches.filter((b) => ["received", "composting"].includes(b.batch_status) && b.quality_status !== "failed" && b.compost_site === block?.assigned_compost_site);
  const [when, setWhen] = useState(malaysiaDateTime);
  const [weight, setWeight] = useState("");
  const [accepted, setAccepted] = useState("");
  const [partial, setPartial] = useState(false);
  const [method, setMethod] = useState<WeightMethod>("calibrated_scale");
  const [contam, setContam] = useState<ContaminationStatus>("clean");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<CollectionStatus>("completed");
  const [selectedBatch, setSelectedBatch] = useState("");
  const batchId = selectedBatch || batches[0]?.batch_id || "";
  const [photo, setPhoto] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const complete = status === "completed";
  const entersBatch = complete && contam !== "rejected";
  return <Guard user={user} allow={["collector"]}><PhoneShell>
    <TopBar user={user} title={block?.block_name ?? "Collection"} back="/collector" />
    <LoopDiagram active={2} />
    {!block || !bin ? <Card className="mt-4">Unknown block or bin.</Card> : saved ? <Card className="mt-4 space-y-4"><h2 className="font-display text-2xl">Collection recorded</h2><p role="status" className="text-sm">{saved}</p><GhostLink href="/collector">Back to collections</GhostLink></Card> : <form className="mt-4" onSubmit={(e) => {
      e.preventDefault(); setError("");
      if (!user) return;
      try {
        const acceptedKg = entersBatch ? Number(partial ? accepted : weight) : 0;
        addCollection({ block_id: blockId, bin_id: bin.bin_id, collector_id: user.user_id, collection_datetime: new Date(`${when}:00+08:00`).toISOString(), weight_kg: complete ? Number(weight) : 0, accepted_weight_kg: acceptedKg, weight_method: method, contamination_status: contam, contamination_notes: notes, destination: entersBatch ? block.assigned_compost_site : complete ? "General waste" : "Not collected", batch_id: entersBatch ? batchId : null, status, photo_url: photo });
        setSaved(!complete ? `Pickup ${status}. No weight has been added to diversion or a batch.` : entersBatch ? `${acceptedKg} kg accepted into ${batchId}. ${Number(weight) - acceptedKg} kg excluded from diversion.${method === "estimated" ? " Weight is labelled as estimated." : ""}` : "Load rejected. No weight has been counted as diverted.");
      } catch (err) { setError(err instanceof Error ? err.message : "Could not save this collection."); }
    }}><Card className="space-y-4">
      <p className="text-sm text-soil-600">{bin.location_text} · {block.assigned_compost_site}</p>
      <Field label="Collection status"><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as CollectionStatus)}><option value="completed">Completed</option><option value="delayed">Delayed</option><option value="missed">Missed</option></select></Field>
      <Field label="Date and time (Malaysia, UTC+8)"><input required className={inputClass} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
      {complete ? <>
        <Field label="Total collected weight (kg)"><input required type="number" min="0.001" step="0.001" className={inputClass} value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label="Weight method"><select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value as WeightMethod)}><option value="calibrated_scale">Calibrated scale</option><option value="estimated">Estimated — shown separately in reports</option></select></Field>
        <Field label="Contamination"><select className={inputClass} value={contam} onChange={(e) => setContam(e.target.value as ContaminationStatus)}><option value="clean">Clean</option><option value="minor">Minor — education first</option><option value="major">Major — explain handling</option><option value="rejected">Rejected — no diversion</option></select></Field>
        {entersBatch ? <><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={partial} onChange={(e) => setPartial(e.target.checked)} />Only part of this load was accepted</label>{partial ? <Field label="Accepted food scraps after sorting (kg)"><input required type="number" min="0.001" max={weight || undefined} step="0.001" className={inputClass} value={accepted} onChange={(e) => setAccepted(e.target.value)} /></Field> : null}<Field label="Destination batch"><select required className={inputClass} value={batchId} onChange={(e) => setSelectedBatch(e.target.value)}>{!batches.length ? <option value="">No open batch — ask the composting team to create one</option> : batches.map((b) => <option key={b.batch_id} value={b.batch_id}>{b.batch_id} · {b.batch_status}</option>)}</select></Field></> : null}
      </> : null}
      <Field label={complete ? "Handling notes and guidance for residents" : "Reason for delay / missed pickup"}><textarea required={!complete || contam !== "clean" || partial} className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What happened, and what should the block do next?" /></Field>
      <PhotoInput value={photo} onChange={setPhoto} />
      {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : null}
      <PrimaryButton type="submit" disabled={entersBatch && !batches.length}>Save collection</PrimaryButton>
    </Card></form>}
  </PhoneShell></Guard>;
}
