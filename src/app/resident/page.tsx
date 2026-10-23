"use client";

import Link from "next/link";
import { DropoffScene } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { LoopDiagram } from "@/components/visuals";
import { checkinCount, divertedKg } from "@/lib/metrics";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function ResidentHome() {
  const { user, block, bin, state } = useSoilLoop();
  const kg = block ? divertedKg(state, block.block_id) : 0;
  const visits = user ? checkinCount(state, user.user_id) : 0;

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title={`Hello, ${user?.name}`} />
        <LoopDiagram active={0} />
        <Card className="mt-4">
          <Pill>Block-level kilos only</Pill>
          <p className="mt-3 font-display text-3xl">{kg} kg</p>
          <p className="text-sm text-soil-600">
            diverted by {block?.block_name} so far — not your personal bag.
          </p>
          <p className="mt-2 text-xs text-soil-500">Your check-ins: {visits}</p>
        </Card>
        <Card className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf-800">
            Next drop-off
          </p>
          <p className="mt-1 font-display text-xl">{block?.collection_schedule}</p>
          <p className="text-sm text-soil-600">{bin?.location_text}</p>
          <div className="mt-3 overflow-hidden rounded-2xl">
            <DropoffScene />
          </div>
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href="/resident/rules" className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="font-semibold">What can I compost?</p>
            <p className="mt-1 text-xs text-soil-500">Yes / no / peel packaging</p>
          </Link>
          <Link href="/resident/search" className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="font-semibold">Can I compost this?</p>
            <p className="mt-1 text-xs text-soil-500">Search the partner list</p>
          </Link>
          <Link href="/resident/find" className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="font-semibold">Find a Soil Loop</p>
            <p className="mt-1 text-xs text-soil-500">Explore sample community sites</p>
          </Link>
          <Link href="/resident/dropoff" className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="font-semibold">Drop-off</p>
            <p className="mt-1 text-xs text-soil-500">Static bin location</p>
          </Link>
          <Link href="/resident/impact" className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="font-semibold">My block</p>
            <p className="mt-1 text-xs text-soil-500">Batch 12 → herb garden</p>
          </Link>
          <Link href="/resident/checkin" className="col-span-2 rounded-3xl bg-leaf-700 p-4 text-white shadow-sm">
            <p className="font-semibold">Check in</p>
            <p className="mt-1 text-xs text-leaf-100">One tap at the bin</p>
          </Link>
        </div>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
