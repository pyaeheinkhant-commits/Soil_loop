import type { AppState } from "@/lib/types";
import { compostProducedKg, compostUsedKg, divertedKg } from "@/lib/metrics";
import {
  BinMark,
  CompostMark,
  GardenMark,
  PeelMark,
  ScaleMark,
} from "./illustrations";

const STEPS = [
  { label: "Scraps", mark: PeelMark },
  { label: "Block bin", mark: BinMark },
  { label: "Weigh", mark: ScaleMark },
  { label: "Compost", mark: CompostMark },
  { label: "Garden", mark: GardenMark },
];

export function LoopDiagram({ active = 0 }: { active?: number }) {
  return (
    <div className="rounded-3xl bg-soil-900 p-4 text-cream">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-cream/70">
        The soil loop
      </p>
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((step, i) => {
          const Mark = step.mark;
          const on = i === active;
          return (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`rounded-full ring-2 ${on ? "ring-leaf-300 scale-110" : "ring-transparent opacity-80"}`}
              >
                <Mark className="h-11 w-11" />
              </div>
              <span className="text-[10px] font-semibold">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConversionBars({
  inputKg,
  outputKg,
  usedKg,
}: {
  inputKg: number;
  outputKg: number;
  usedKg: number;
}) {
  const max = Math.max(inputKg, 1);
  return (
    <div className="space-y-3">
      {[
        { label: "Food scraps accepted", value: inputKg, color: "bg-clay-500", note: "Accepted input; see collection records for weighed or estimated amounts" },
        { label: "Finished compost", value: outputKg, color: "bg-leaf-600", note: "Weighed after composting; moisture and material break down" },
        { label: "Compost used in garden", value: usedKg, color: "bg-soil-700", note: "Applied to garden beds" },
      ].map((row) => (
        <div key={row.label}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium">{row.label}</span>
            <span className="font-display text-lg">{row.value} kg</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-cream-200">
            <div
              className={`h-full rounded-full ${row.color}`}
              style={{ width: `${Math.min(100, (row.value / max) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-soil-500">{row.note}</p>
        </div>
      ))}
    </div>
  );
}

export function PrecinctFlow({ state }: { state: AppState }) {
  const inKg = divertedKg(state);
  const outKg = compostProducedKg(state);
  const used = compostUsedKg(state);
  return (
    <div className="rounded-3xl border border-soil-100 bg-white p-4">
      <p className="mb-3 text-sm font-semibold">Honest mass balance</p>
      <ConversionBars inputKg={inKg} outputKg={outKg} usedKg={used} />
      <p className="mt-3 text-xs leading-5 text-soil-500">
        Food scraps, finished compost and garden use are recorded separately. Input can include estimated collection weights; finished output is recorded after processing.
      </p>
    </div>
  );
}

export function BlockBars({
  rows,
}: {
  rows: { name: string; kg: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.kg), 1);
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-3">
          <span className="w-16 text-xs font-medium">{row.name}</span>
          <div className="h-6 flex-1 overflow-hidden rounded-full bg-cream-200">
            <div
              className="flex h-full items-center rounded-full bg-leaf-600 px-2 text-[11px] font-semibold text-white"
              style={{ width: `${(row.kg / max) * 100}%`, minWidth: row.kg ? "3rem" : 0 }}
            >
              {row.kg ? `${Number(row.kg.toFixed(3))} kg` : ""}
            </div>
          </div>
          {row.kg === 0 ? <span className="text-xs">0 kg</span> : null}
        </div>
      ))}
    </div>
  );
}

export function Pipeline({ status }: { status: string }) {
  const steps = ["received", "composting", "ready"];
  const idx = Math.max(0, steps.indexOf(status));
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex flex-1 items-center gap-1">
          <div
            className={`h-2 flex-1 rounded-full ${
              status === "failed"
                ? "bg-clay-500"
                : i <= idx
                  ? "bg-leaf-600"
                  : "bg-cream-200"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
