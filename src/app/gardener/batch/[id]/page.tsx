"use client";

import { use, useState } from "react";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { ConversionBars, Pipeline } from "@/components/visuals";
import { updateBatch } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";
import type { BatchStatus, QualityStatus } from "@/lib/types";

export default function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
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
                updateBatch(id, {
                  batch_status: status,
                  quality_status: quality,
                  quality_notes: notes,
                  output_compost_kg: output ? Number(output) : null,
                  actual_ready_date:
                    status === "ready"
                      ? new Date().toISOString().slice(0, 10)
                      : batch.actual_ready_date,
                });
                setSaved(true);
              }}
            >
              <Card className="space-y-3">
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
                  <input className={inputClass} value={output} onChange={(e) => setOutput(e.target.value)} />
                </Field>
                <Field label="Quality notes">
                  <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
                <PrimaryButton type="submit">Update batch</PrimaryButton>
                {saved ? <p className="text-xs text-leaf-800">Saved for this demo session.</p> : null}
              </Card>
            </form>
          </>
        )}
      </PhoneShell>
    </Guard>
  );
}
