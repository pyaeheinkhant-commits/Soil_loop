"use client";

import Link from "next/link";
import { CompostMark } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { LoopDiagram, Pipeline } from "@/components/visuals";
import { useSoilLoop } from "@/lib/use-soil-loop";
import { GardenDemand } from "@/components/garden-demand";
import { ProgrammeMedia } from "@/components/programme-media";

export default function GardenerHome() {
  const { user, state } = useSoilLoop();

  return (
    <Guard user={user} allow={["gardener"]}>
      <PhoneShell>
        <TopBar user={user} title="Compost batches" />
        <LoopDiagram active={3} />
        <Link href="/gardener/new" className="mt-4 block rounded-2xl border border-leaf-700 p-3 text-center text-sm font-semibold text-leaf-800">+ Start a new batch</Link>
        <div className="mt-4 flex items-center gap-3">
          <CompostMark />
          <p className="text-sm text-soil-600">
            Input scraps and output compost are stored separately. Ready compost
            can be used in the herb garden.
          </p>
        </div>
        <Link
          href="/gardener/use"
          className="mt-4 block rounded-3xl bg-leaf-700 p-4 text-white shadow-sm"
        >
          <p className="font-semibold">Use compost in the herb garden</p>
          <p className="mt-1 text-xs text-leaf-100">Quantity, beds, short update</p>
        </Link>
        <div className="mt-4 space-y-3">
          {state.batches.map((batch) => (
            <Link key={batch.batch_id} href={`/gardener/batch/${batch.batch_id}`}>
              <Card className="mb-3">
                <div className="flex items-center justify-between">
                  <p className="font-display text-xl">{batch.batch_id}</p>
                  <Pill>{batch.batch_status}</Pill>
                </div>
                <p className="mt-1 text-xs text-soil-500">{batch.composting_method}</p>
                <div className="mt-3">
                  <Pipeline status={batch.batch_status} />
                </div>
                <p className="mt-3 text-sm">
                  In {batch.input_weight_kg} kg · Out {batch.output_compost_kg ?? "—"} kg
                </p>
                <p className="text-xs text-soil-500">
                  Sources: {batch.source_block_ids.join(", ")}
                </p>
              </Card>
            </Link>
          ))}
        </div>
        <GardenDemand editable />
        <ProgrammeMedia stage="compost" />
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
