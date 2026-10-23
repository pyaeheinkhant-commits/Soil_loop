"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { LoopDiagram } from "@/components/visuals";
import { addCollection } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";
import type {
  CollectionStatus,
  ContaminationStatus,
  WeightMethod,
} from "@/lib/types";

export default function RecordCollectionPage({
  params,
}: {
  params: Promise<{ blockId: string }>;
}) {
  const { blockId } = use(params);
  const router = useRouter();
  const { user, state } = useSoilLoop();
  const block = state.blocks.find((b) => b.block_id === blockId);
  const bin = state.bins.find((b) => b.block_id === blockId);
  const [when, setWhen] = useState(() => new Date().toISOString().slice(0, 16));
  const [weight, setWeight] = useState("18");
  const [method, setMethod] = useState<WeightMethod>("calibrated_scale");
  const [contam, setContam] = useState<ContaminationStatus>("clean");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<CollectionStatus>("completed");
  const [batchId, setBatchId] = useState("BATCH-013");
  const [saved, setSaved] = useState(false);

  return (
    <Guard user={user} allow={["collector"]}>
      <PhoneShell>
        <TopBar user={user} title={block?.block_name ?? "Collection"} back="/collector" />
        <LoopDiagram active={2} />
        {saved ? (
          <Card className="mt-4">
            <p className="font-display text-2xl">Logged</p>
            <p className="mt-2 text-sm text-soil-600">
              {contam === "rejected"
                ? "Rejected. This weight will not appear in diverted totals."
                : `${weight} kg assigned to ${batchId}.`}
            </p>
            <button
              className="mt-4 text-sm font-semibold text-leaf-800"
              onClick={() => router.push("/collector")}
            >
              Back to today’s list
            </button>
          </Card>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!user || !block || !bin) return;
              const rejected = contam === "rejected";
              addCollection({
                block_id: block.block_id,
                bin_id: bin.bin_id,
                collector_id: user.user_id,
                collection_datetime: new Date(when).toISOString(),
                weight_kg: Number(weight) || 0,
                weight_method: method,
                contamination_status: contam,
                contamination_notes: notes,
                destination: rejected ? "General waste" : block.assigned_compost_site,
                batch_id: rejected || status !== "completed" ? null : batchId,
                status,
              });
              setSaved(true);
            }}
          >
            <Card className="space-y-3">
              <Field label="Date and time">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </Field>
              <Field label="Weight (kg)">
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Field>
              <Field label="Weight method">
                <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value as WeightMethod)}>
                  <option value="calibrated_scale">Calibrated scale</option>
                  <option value="estimated">Estimated (labelled)</option>
                </select>
              </Field>
              <Field label="Contamination">
                <select className={inputClass} value={contam} onChange={(e) => setContam(e.target.value as ContaminationStatus)}>
                  <option value="clean">Clean</option>
                  <option value="minor">Minor — educate the block</option>
                  <option value="major">Major</option>
                  <option value="rejected">Rejected — do not divert</option>
                </select>
              </Field>
              <Field label="Notes">
                <textarea
                  className={inputClass}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Plastic bag observed…"
                />
              </Field>
              <Field label="Collection status">
                <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as CollectionStatus)}>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                  <option value="missed">Missed</option>
                </select>
              </Field>
              <Field label="Assign batch">
                <select className={inputClass} value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                  {state.batches.map((b) => (
                    <option key={b.batch_id} value={b.batch_id}>
                      {b.batch_id} · {b.batch_status}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="text-xs text-soil-500">
                Destination: {block?.assigned_compost_site}
              </p>
              <PrimaryButton type="submit">Save collection</PrimaryButton>
            </Card>
          </form>
        )}
      </PhoneShell>
    </Guard>
  );
}
