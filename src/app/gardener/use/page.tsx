"use client";

import { useState } from "react";
import { GardenScene } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { LoopDiagram } from "@/components/visuals";
import { addCompostUse } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function UseCompostPage() {
  const { user, state } = useSoilLoop();
  const garden = state.gardens[0];
  const ready = state.batches.filter((b) => b.batch_status === "ready");
  const [batchId, setBatchId] = useState(ready[0]?.batch_id ?? "BATCH-012");
  const [kg, setKg] = useState("5");
  const [beds, setBeds] = useState("Beds 1–4");
  const [notes, setNotes] = useState("Top-dressed mint and chilli.");
  const [photo, setPhoto] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <Guard user={user} allow={["gardener"]}>
      <PhoneShell>
        <TopBar user={user} title="Use compost" />
        <LoopDiagram active={4} />
        <div className="mt-4 overflow-hidden rounded-3xl">
          <GardenScene />
        </div>
        <Card className="mt-4">
          <p className="font-display text-xl">{garden?.garden_name}</p>
          <p className="text-xs text-soil-500">{garden?.location}</p>
        </Card>
        <div className="mt-3 space-y-2">
          {state.compost_uses.map((use) => (
            <Card key={use.use_id}>
              <p className="text-sm font-semibold">
                {use.compost_used_kg} kg from {use.batch_id}
              </p>
              <p className="text-xs text-soil-500">
                {use.usage_date} · {use.garden_area}
              </p>
              <p className="mt-1 text-sm">{use.update_notes}</p>
            </Card>
          ))}
        </div>
        {saved ? (
          <Card className="mt-4">
            <p className="font-semibold">Garden update saved.</p>
            <p className="text-sm text-soil-600">Residents will see this on the block impact story.</p>
          </Card>
        ) : (
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!garden) return;
              addCompostUse({
                garden_id: garden.garden_id,
                batch_id: batchId,
                compost_used_kg: Number(kg) || 0,
                usage_date: new Date().toISOString().slice(0, 10),
                garden_area: beds,
                update_notes: notes,
                photo_url: photo,
              });
              setSaved(true);
            }}
          >
            <Card className="space-y-3">
              <Field label="Batch">
                <select className={inputClass} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                  {state.batches.map((b) => (
                    <option key={b.batch_id} value={b.batch_id}>
                      {b.batch_id} ({b.batch_status})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Quantity used (kg)">
                <input className={inputClass} value={kg} onChange={(e) => setKg(e.target.value)} />
              </Field>
              <Field label="Beds">
                <input className={inputClass} value={beds} onChange={(e) => setBeds(e.target.value)} />
              </Field>
              <Field label="Short update">
                <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
              <Field label="Photo URL (optional)">
                <input className={inputClass} value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://…" />
              </Field>
              <PrimaryButton type="submit">Record garden use</PrimaryButton>
            </Card>
          </form>
        )}
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
