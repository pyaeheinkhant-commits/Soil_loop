"use client";

import Link from "next/link";
import { ScaleMark } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { LoopDiagram } from "@/components/visuals";
import { contaminationLabel, isAccepted } from "@/lib/metrics";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function CollectorHome() {
  const { user, state } = useSoilLoop();
  const today = state.blocks.map((block) => {
    const bin = state.bins.find((b) => b.block_id === block.block_id);
    const last = [...state.collections]
      .filter((c) => c.block_id === block.block_id)
      .sort((a, b) => b.collection_datetime.localeCompare(a.collection_datetime))[0];
    return { block, bin, last };
  });

  return (
    <Guard user={user} allow={["collector"]}>
      <PhoneShell>
        <TopBar user={user} title="Today’s collections" />
        <LoopDiagram active={2} />
        <div className="mt-4 flex items-center gap-3">
          <ScaleMark />
          <p className="text-sm text-soil-600">
            Record weight, contamination and batch. Rejected loads do not count
            as diverted kilograms.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {today.map(({ block, bin, last }) => (
            <Card key={block.block_id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl">{block.block_name}</p>
                  <p className="text-xs text-soil-500">{block.collection_schedule}</p>
                  <p className="text-xs text-soil-500">{bin?.location_text}</p>
                </div>
                <Pill>{bin?.status.replace("_", " ")}</Pill>
              </div>
              {last ? (
                <p className="mt-2 text-sm text-soil-600">
                  Last: {last.weight_kg} kg · {contaminationLabel(last.contamination_status)}
                  {isAccepted(last) ? "" : " · not diverted"}
                </p>
              ) : null}
              <Link
                href={`/collector/record/${block.block_id}`}
                className="mt-3 block rounded-2xl bg-leaf-700 py-2.5 text-center text-sm font-semibold text-white"
              >
                Record collection
              </Link>
            </Card>
          ))}
        </div>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
