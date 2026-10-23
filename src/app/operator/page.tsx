"use client";

import { RoleNav } from "@/components/role-nav";
import { Card, GhostLink, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { BlockBars, LoopDiagram, PrecinctFlow } from "@/components/visuals";
import {
  compostProducedKg,
  compostUsedKg,
  contaminationRate,
  divertedKg,
  perBlockRows,
} from "@/lib/metrics";
import { useSoilLoop } from "@/lib/use-soil-loop";

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-wide text-soil-500">{label}</p>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs text-soil-500">{hint}</p>
    </Card>
  );
}

export default function OperatorPage() {
  const { user, state } = useSoilLoop();
  const rows = perBlockRows(state);
  const pipeline = state.batches.filter((b) =>
    ["received", "composting"].includes(b.batch_status),
  ).length;
  const rate = Math.round(contaminationRate(state) * 100);

  return (
    <Guard user={user} allow={["operator", "collector"]}>
      <PhoneShell>
        <TopBar user={user} title="Precinct 3" />
        <LoopDiagram active={4} />
        {user?.role === "operator" ? (
          <Card className="mt-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Community receiving sites</p>
                <p className="mt-1 text-sm leading-5 text-soil-600">
                  Manage locations that accept food waste, their drop-off setup, and receiving rules. Condos and malls are source clients.
                </p>
              </div>
              <Pill>{state.community_sites.length} sites</Pill>
            </div>
            <GhostLink href="/operator/sites">
              Manage community sites{state.site_requests.length ? ` · ${state.site_requests.length} condo requests` : ""}
            </GhostLink>
          </Card>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Kpi label="Diverted" value={`${divertedKg(state)} kg`} hint="Accepted collections only" />
          <Kpi label="Active blocks" value={String(state.blocks.length)} hint="A, B and C" />
          <Kpi label="Contamination" value={`${rate}%`} hint="Share of loads not clean" />
          <Kpi label="In pipeline" value={String(pipeline)} hint="Batches still composting" />
          <Kpi label="Compost out" value={`${compostProducedKg(state)} kg`} hint="Ready batches" />
          <Kpi label="Gardens" value={String(state.gardens.length)} hint={`${compostUsedKg(state)} kg used`} />
        </div>
        <div className="mt-4">
          <PrecinctFlow state={state} />
        </div>
        <Card className="mt-4">
          <p className="mb-3 text-sm font-semibold">Per-block table</p>
          <BlockBars
            rows={rows.map((r) => ({ name: r.block.block_name, kg: r.diverted }))}
          />
          <div className="mt-4 overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="text-soil-500">
                <tr>
                  <th className="py-1">Block</th>
                  <th>kg</th>
                  <th>Check-ins</th>
                  <th>Contam.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.block.block_id} className="border-t border-cream-200">
                    <td className="py-2 font-semibold">{r.block.block_name}</td>
                    <td>{r.diverted}</td>
                    <td>{r.checkins}</td>
                    <td>{Math.round(r.contamination * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
