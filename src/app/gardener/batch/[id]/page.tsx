"use client";

import { use, useState } from "react";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { ConversionBars, Pipeline } from "@/components/visuals";
import { updateBatch } from "@/lib/store";
import { malaysiaDate, availableKg } from "@/lib/operations";
import { useSoilLoop } from "@/lib/use-soil-loop";
import type { BatchStatus, QualityStatus } from "@/lib/types";

export default function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useSoilLoop();
  return <Guard user={user} allow={["gardener"]}><BatchEditor key={id} id={id} /></Guard>;
}

function BatchEditor({ id }: { id: string }) {
  const { user, state } = useSoilLoop();
  const batch = state.batches.find((b) => b.batch_id === id);
  const used = state.compost_uses
    .filter((u) => u.batch_id === id)
    .reduce((sum, u) => sum + u.compost_used_kg, 0);
  const [status, setStatus] = useState<BatchStatus>(batch?.batch_status ?? "received");
  const [quality, setQuality] = useState<QualityStatus>(batch?.quality_status ?? "pending");
  const [output, setOutput] = useState(String(batch?.output_compost_kg ?? ""));
  const [notes, setNotes] = useState(batch?.quality_notes ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [actualDate, setActualDate] = useState(batch?.actual_ready_date ?? malaysiaDate());
  const [expected, setExpected] = useState(batch?.expected_ready_date ?? "");

  return (
    <Guard user={user} allow={["gardener"]}>
      <PhoneShell>
        <TopBar user={user} title={id} back="/gardener" />
        {!batch ? (
          <Card>Unknown batch.</Card>
        ) : (
          <>
            <Pipeline status={batch.batch_status} />
            <Card className="mt-4">
              <p className="text-sm text-soil-600">
                {batch.compost_site} · started {batch.start_date}
              </p>
              <p className="mt-1 text-sm">
                Expected ready {batch.expected_ready_date}
                {batch.actual_ready_date ? ` · actual ${batch.actual_ready_date}` : ""}
              </p>
              <div className="mt-4">
                <p className="mb-3 text-sm font-semibold">Available compost: {availableKg(state, id)} kg · Quality: {batch.quality_status}</p>
                <ConversionBars
                  inputKg={batch.input_weight_kg}
                  outputKg={batch.output_compost_kg ?? 0}
                  usedKg={used}
                />
              </div>
            </Card>
            <form
              className="mt-3"
              onSubmit={(e) => {
                e.preventDefault();
                setError(""); setSaved(false);
                try {
                updateBatch(id, {
                  batch_status: status,
                  quality_status: quality,
                  quality_notes: notes,
                  output_compost_kg: output ? Number(output) : null,
                  actual_ready_date:
                    status === "ready" ? actualDate : null,
                  expected_ready_date: expected,
                });
                setSaved(true);
                } catch (err) { setError(err instanceof Error ? err.message : "Could not update batch."); }
              }}
            >
              <Card className="space-y-3">
                <Field label="Expected ready date"><input required type="date" min={batch.start_date} className={inputClass} value={expected} onChange={(e) => setExpected(e.target.value)} /></Field>
                <Field label="Lifecycle">
                  <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as BatchStatus)}>
                    <option value="received">Received</option>
                    <option value="composting">Composting</option>
                    <option value="ready">Ready</option>
                    <option value="failed">Failed</option>
                  </select>
                </Field>
                <Field label="Quality">
                  <select className={inputClass} value={quality} onChange={(e) => setQuality(e.target.value as QualityStatus)}>
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                  </select>
                </Field>
                <Field label="Output compost (kg)">
                  <input type="number" min={used} step="0.001" className={inputClass} value={output} onChange={(e) => setOutput(e.target.value)} />
                </Field>
                {status === "ready" ? <Field label="Actual ready date"><input required type="date" min={batch.start_date} className={inputClass} value={actualDate} onChange={(e) => setActualDate(e.target.value)} /></Field> : null}
                <Field label="Quality notes">
                  <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
                <PrimaryButton type="submit">Update batch</PrimaryButton>
                {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : null}
                {saved ? <p className="text-xs text-leaf-800">Saved for this demo session.</p> : null}
              </Card>
            </form>
          </>
        )}
      </PhoneShell>
    </Guard>
  );
}
