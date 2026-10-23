"use client";

import Link from "next/link";
import { DropoffScene } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { LoopDiagram } from "@/components/visuals";
import { checkinCount, divertedKg } from "@/lib/metrics";
import { useSoilLoop } from "@/lib/use-soil-loop";
import { acceptedKg } from "@/lib/operations";

export default function ResidentHome() {
  const { user, block, bin, state } = useSoilLoop();
  const kg = block ? divertedKg(state, block.block_id) : 0;
  const visits = user ? checkinCount(state, user.user_id) : 0;
  const estimated = state.collections.filter((c) => c.block_id === block?.block_id && c.weight_method === "estimated").reduce((sum, c) => sum + acceptedKg(c), 0);
  const latest = state.collections.filter((c) => c.block_id === block?.block_id).sort((a, b) => b.collection_datetime.localeCompare(a.collection_datetime))[0];

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title={`Hello, ${user?.name}`} />
        <section className="mb-4 rounded-3xl bg-leaf-800 p-5 text-white"><p className="text-[11px] uppercase tracking-[0.18em] text-leaf-100">Your neighbourhood soil loop</p><h2 className="mt-2 font-display text-3xl leading-tight">Yesterday’s scraps.<br />Tomorrow’s garden.</h2><p className="mt-3 text-sm leading-6 text-leaf-100">Save a little, sort it well, and see what your block grows together.</p></section>
        <LoopDiagram active={0} />
        <Card className="mt-4">
          <Pill>Block-level kilos only</Pill>
          <p className="mt-3 font-display text-3xl">{kg} kg</p>
          <p className="text-sm text-soil-600">
            accepted from {block?.block_name} so far.
          </p>
          <p className="mt-2 text-xs text-soil-500">Your check-ins: {visits}</p>
          <p className="mt-1 text-xs text-soil-500">{kg - estimated} kg weighed · {estimated} kg estimated</p>
        </Card>
        <Card className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf-800">
            Next drop-off
          </p>
          <p className="mt-1 font-display text-xl">{block?.dropoff_schedule ?? "Sunday, 8:00 AM–12:00 PM"}</p>
          <p className="mt-2 text-sm font-semibold text-leaf-800">Bin: {bin?.status.replaceAll("_", " ")}</p>
          <p className="mt-1 text-xs text-soil-500">Collector pickup: {block?.collection_schedule}</p>
          <p className="text-sm text-soil-600">{bin?.location_text}</p>
          <div className="mt-3 overflow-hidden rounded-2xl">
            <DropoffScene />
          </div>
        </Card>
        {latest && (latest.contamination_notes || latest.status !== "completed") ? <Card className="mt-4 border-l-4 border-clay-500"><h2 className="text-sm font-semibold">A note for {block?.block_name}</h2><p className="mt-2 text-sm text-soil-600">{latest.contamination_notes || `Last pickup: ${latest.status}. Please check for a new collection update.`}</p><Link href="/resident/rules" className="mt-2 inline-block text-xs font-semibold text-leaf-800">Review our sorting guide →</Link></Card> : null}
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
            <p className="mt-1 text-xs text-soil-500">Location, hours and bin status</p>
          </Link>
          <Link href="/resident/impact" className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="font-semibold">My block</p>
            <p className="mt-1 text-xs text-soil-500">Follow our scraps to the garden</p>
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
