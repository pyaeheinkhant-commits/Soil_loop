"use client";
import { useState } from "react";
import { GardenScene } from "@/components/illustrations";
import { PhotoInput, RealMedia } from "@/components/real-media";
import { RoleNav } from "@/components/role-nav";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { addCompostUse } from "@/lib/store";
import { availableKg, malaysiaDate } from "@/lib/operations";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function UseCompostPage() {
  const { user, state } = useSoilLoop();
  const gardens = state.gardens.filter((g) => g.gardener_id === user?.user_id);
  const ready = state.batches.filter((b) => b.batch_status === "ready" && b.quality_status === "passed" && availableKg(state, b.batch_id) > 0);
  const [selectedGarden, setGarden] = useState("");
  const gardenId = selectedGarden || gardens[0]?.garden_id || "";
  const [selectedBatch, setBatch] = useState("");
  const batchId = selectedBatch || ready[0]?.batch_id || "";
  const [kg, setKg] = useState("");
  const [date, setDate] = useState(malaysiaDate);
  const [beds, setBeds] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState("");
  const [video, setVideo] = useState("");
  const [credit, setCredit] = useState("");
  const [transcript, setTranscript] = useState("");
  const [requestId, setRequestId] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const uses = state.compost_uses.filter((u) => u.garden_id === gardenId).slice().reverse();
  const requests = state.compost_requests.filter((r) => r.garden_id === gardenId);
  return <Guard user={user} allow={["gardener"]}><PhoneShell>
    <TopBar user={user} title="Grow something good" back="/gardener" />
    <div className="overflow-hidden rounded-3xl"><GardenScene /></div>
    {saved ? <Card className="mt-4 space-y-3"><p role="status" className="font-semibold">Garden update saved.</p><p className="text-sm text-soil-600">Contributing blocks can now see this update in their impact timeline.</p><PrimaryButton onClick={() => { setSaved(false); setKg(""); setPhoto(""); setVideo(""); setCredit(""); setTranscript(""); setNotes(""); setBatch(""); }}>Record another use</PrimaryButton></Card> : <form className="mt-4" onSubmit={(e) => {
      e.preventDefault(); setError("");
      try { addCompostUse({ garden_id: gardenId, batch_id: batchId, compost_used_kg: Number(kg), usage_date: date, garden_area: beds, update_notes: notes, photo_url: photo, video_url: video, media_credit: credit, video_description: transcript, request_id: requestId || undefined }); setSaved(true); }
      catch (err) { setError(err instanceof Error ? err.message : "Could not save garden use."); }
    }}><Card className="space-y-4">
      <Field label="Garden"><select required className={inputClass} value={gardenId} onChange={(e) => { setGarden(e.target.value); setRequestId(""); }}>{gardens.map((g) => <option key={g.garden_id} value={g.garden_id}>{g.garden_name}</option>)}</select></Field>
      <Field label="Ready compost"><select required className={inputClass} value={batchId} onChange={(e) => setBatch(e.target.value)}>{ready.length ? ready.map((b) => <option key={b.batch_id} value={b.batch_id}>{b.batch_id} · {availableKg(state, b.batch_id)} kg available</option>) : <option value="">No quality-passed compost available</option>}</select></Field>
      <Field label="Quantity used (kg)"><input required className={inputClass} type="number" min="0.001" max={availableKg(state, batchId)} step="0.001" value={kg} onChange={(e) => setKg(e.target.value)} /></Field>
      <Field label="Usage date"><input required type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      {requests.length ? <Field label="Fulfil a garden request (optional)"><select className={inputClass} value={requestId} onChange={(e) => setRequestId(e.target.value)}><option value="">No linked request</option>{requests.map((r) => <option key={r.request_id} value={r.request_id}>{r.requested_kg} kg · {r.purpose}</option>)}</select></Field> : null}
      <Field label="Garden beds or area"><input required className={inputClass} value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="Herb beds 1–4" /></Field>
      <Field label="What changed in the garden?"><textarea required className={inputClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe planting, soil application or a harvest." /></Field>
      <details className="rounded-2xl border border-soil-100 p-3"><summary className="cursor-pointer text-sm font-semibold">Add real photos or a video</summary><div className="mt-3 space-y-3">
        <p className="text-xs text-soil-500">Use your own or permission-cleared footage. Illustrations remain part of the story.</p>
        <PhotoInput value={photo} onChange={setPhoto} />
        <Field label="Video file URL (MP4 / WebM, optional)"><input className={inputClass} value={video} onChange={(e) => setVideo(e.target.value)} placeholder="/media/garden-tour.mp4" /></Field>
        <Field label="Photographer / filmmaker or source"><input required={!!(photo || video)} className={inputClass} value={credit} onChange={(e) => setCredit(e.target.value)} /></Field>
        <Field label="Video description or transcript"><textarea required={!!video} className={inputClass} value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={3} /></Field>
      </div></details>
      {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : null}<PrimaryButton type="submit" disabled={!ready.length || !gardenId}>Record garden use</PrimaryButton>
    </Card></form>}
    <h2 className="mb-3 mt-6 font-display text-xl">Garden journal</h2>
    <div className="space-y-3">{uses.length ? uses.map((entry) => <Card key={entry.use_id}><p className="text-sm font-semibold">{entry.compost_used_kg} kg from {entry.batch_id}</p><p className="mb-3 text-xs text-soil-500">{entry.usage_date} · {entry.garden_area}</p><RealMedia photo={entry.photo_url} video={entry.video_url} credit={entry.media_credit} description={entry.update_notes} transcript={entry.video_description} /><p className="mt-3 text-sm">{entry.update_notes}</p></Card>) : <Card>No garden uses recorded yet.</Card>}</div>
    {user ? <RoleNav role={user.role} /> : null}
  </PhoneShell></Guard>;
}
