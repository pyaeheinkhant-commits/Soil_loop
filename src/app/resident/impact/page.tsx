"use client";

import { GardenScene } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { BlockBars, ConversionBars, LoopDiagram, Pipeline } from "@/components/visuals";
import {
  blockCheckins,
  checkinCount,
  communityVisitCount,
  divertedKg,
} from "@/lib/metrics";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function ImpactPage() {
  const { user, block, state } = useSoilLoop();
  const kg = block ? divertedKg(state, block.block_id) : 0;
  const visits = user ? checkinCount(state, user.user_id) : 0;
  const communityVisits = user ? communityVisitCount(state, user.user_id) : 0;
  const batch = state.batches.find((b) => b.batch_id === "BATCH-012");
  const garden = state.gardens[0];
  const use = state.compost_uses[0];
  const rows = state.blocks.map((b) => ({
    name: b.block_name,
    kg: divertedKg(state, b.block_id),
  }));

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title={`${block?.block_name} impact`} back="/resident" />
        <LoopDiagram active={4} />
        <Card className="mt-4">
          <Pill>Honest story</Pill>
          <p className="mt-2 font-display text-3xl">{kg} kg diverted</p>
          <p className="text-sm text-soil-600">
            Accepted collections for {block?.block_name}. Rejected loads are not
            counted.
          </p>
          <p className="mt-2 text-xs text-soil-500">
            You checked in {visits} times. Block check-ins:{" "}
            {block ? blockCheckins(state, block.block_id) : 0}.
          </p>
        </Card>
        <Card className="mt-4">
          <p className="text-sm font-semibold">Community drop-off visits</p>
          <p className="mt-1 font-display text-3xl">{communityVisits}</p>
        </Card>
        <Card className="mt-4">
          <p className="text-sm font-semibold">Precinct contribution</p>
          <div className="mt-3">
            <BlockBars rows={rows} />
          </div>
        </Card>
        {batch ? (
          <Card className="mt-4 space-y-3">
            <p className="text-sm font-semibold">Batch 12</p>
            <Pipeline status={batch.batch_status} />
            <p className="text-sm leading-6 text-soil-700">
              Batch 12 is a shared composting record. It received {batch.input_weight_kg} kg
              of accepted food scraps and yielded {batch.output_compost_kg} kg of finished
              compost after processing. Your block&apos;s diverted total above counts
              accepted collections; it is separate from the compost produced.
            </p>
            <ConversionBars
              inputKg={batch.input_weight_kg}
              outputKg={batch.output_compost_kg ?? 0}
              usedKg={use?.compost_used_kg ?? 0}
            />
          </Card>
        ) : null}
        <Card className="mt-4">
          <p className="text-sm font-semibold">{garden?.garden_name}</p>
          <p className="text-xs text-soil-500">{garden?.location}</p>
          <div className="my-3 overflow-hidden rounded-2xl">
            <GardenScene />
          </div>
          {use?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={use.photo_url}
              alt="Garden update"
              className="mb-3 h-36 w-full rounded-2xl object-cover"
            />
          ) : null}
          <p className="text-sm leading-6 text-soil-700">{use?.update_notes}</p>
          <p className="mt-2 text-xs text-soil-500">
            {use?.compost_used_kg} kg from {use?.batch_id} on {use?.usage_date} ·{" "}
            {use?.garden_area}
          </p>
        </Card>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
