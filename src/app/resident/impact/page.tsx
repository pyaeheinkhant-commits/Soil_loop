"use client";
import { useState } from "react";
import { GardenScene } from "@/components/illustrations";
import { RealMedia } from "@/components/real-media";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, TopBar, inputClass } from "@/components/ui";
import { BlockBars, ConversionBars, Pipeline } from "@/components/visuals";
import { communityVisitCount, divertedKg } from "@/lib/metrics";
import { acceptedKg, malaysiaDate } from "@/lib/operations";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function ImpactPage() {
  const { user, block, state } = useSoilLoop();
  const [period, setPeriod] = useState("all");
  const [today] = useState(malaysiaDate);
  const start = period === "month" ? `${today.slice(0, 7)}-01` : period === "week" ? malaysiaDate(new Date(Date.parse(`${today}T00:00:00+08:00`) - 6 * 86400000)) : "";
  const inPeriod = (date: string) => !start || (malaysiaDate(new Date(date)).slice(0, 10) >= start && malaysiaDate(new Date(date)).slice(0, 10) <= today);
  const collections = state.collections.filter((c) => c.block_id === block?.block_id).sort((a, b) => b.collection_datetime.localeCompare(a.collection_datetime));
  const shown = collections.filter((c) => inPeriod(c.collection_datetime));
  const weighed = shown.filter((c) => c.weight_method === "calibrated_scale").reduce((sum, c) => sum + acceptedKg(c), 0);
  const estimated = shown.filter((c) => c.weight_method === "estimated").reduce((sum, c) => sum + acceptedKg(c), 0);
  const personal = state.checkins.filter((c) => c.user_id === user?.user_id && inPeriod(c.timestamp)).length;
  const batchIds = new Set(collections.filter((c) => acceptedKg(c) > 0).map((c) => c.batch_id));
  const batches = state.batches.filter((b) => batchIds.has(b.batch_id)).sort((a, b) => b.start_date.localeCompare(a.start_date));
  const uses = state.compost_uses.filter((u) => batchIds.has(u.batch_id)).sort((a, b) => b.usage_date.localeCompare(a.usage_date));
  return <Guard user={user} allow={["resident"]}><PhoneShell>
    <TopBar user={user} title={`${block?.block_name ?? "Your block"} is growing`} back="/resident" />
    <section className="overflow-hidden rounded-3xl bg-leaf-800 text-white"><div className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-leaf-100">Small scraps. Shared progress.</p><h2 className="mt-2 font-display text-3xl">From your block,<br />back to the garden.</h2><p className="mt-3 text-sm text-leaf-100">Follow the records behind every part of the loop.</p></div><GardenScene /></section>
    <div className="my-4"><label className="text-sm font-semibold">Impact period<select className={`${inputClass} mt-1`} value={period} onChange={(e) => setPeriod(e.target.value)}><option value="all">All recorded time</option><option value="month">This month (Malaysia)</option><option value="week">Last 7 days (Malaysia)</option></select></label></div>
    <div className="grid grid-cols-2 gap-3"><Card><p className="text-xs text-soil-500">Block diversion</p><p className="mt-1 font-display text-3xl">{Number((weighed + estimated).toFixed(3))} <span className="text-base">kg</span></p><p className="mt-2 text-xs text-soil-600">{weighed} kg weighed · {estimated} kg estimated</p></Card><Card><p className="text-xs text-soil-500">Your participation</p><p className="mt-1 font-display text-3xl">{personal}</p><p className="mt-2 text-xs text-soil-600">Block check-ins in this period</p></Card></div>
    <p className="my-3 text-xs leading-5 text-soil-500">Only accepted material counts. Shared bins measure block weight; your check-ins count participation. Community visits, all time: {user ? communityVisitCount(state, user.user_id) : 0}.</p>
    <h2 className="mb-3 mt-6 font-display text-xl">Your block’s journey</h2><p className="mb-3 text-xs text-soil-500">All batches your block contributed to, across all dates.</p>
    <div className="space-y-3">{batches.length ? batches.map((batch) => {
      const contribution = collections.filter((c) => c.batch_id === batch.batch_id).reduce((sum, c) => sum + acceptedKg(c), 0);
      const batchUses = state.compost_uses.filter((u) => u.batch_id === batch.batch_id);
      return <Card key={batch.batch_id} className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{batch.batch_id}</h3><Pill>{batch.batch_status}</Pill></div><Pipeline status={batch.batch_status} /><p className="text-sm leading-6">{block?.block_name} contributed <strong>{contribution} kg</strong> to this shared batch at {batch.compost_site}.</p><p className="text-xs text-soil-600">{batch.composting_method} · Started {batch.start_date}<br />{batch.actual_ready_date ? `Ready ${batch.actual_ready_date}` : `Expected ${batch.expected_ready_date}`} · Quality {batch.quality_status}</p><ConversionBars inputKg={batch.input_weight_kg} outputKg={batch.output_compost_kg ?? 0} usedKg={batchUses.reduce((sum, u) => sum + u.compost_used_kg, 0)} />{batch.output_compost_kg === null ? <p className="text-xs text-soil-500">Finished output has not been recorded yet.</p> : null}<p className="text-xs text-soil-500">Compost output belongs to the whole batch, shared by its contributing blocks.</p></Card>;
    }) : <Card>Your block has no accepted collection linked to a batch yet.</Card>}</div>
    <h2 className="mb-3 mt-6 font-display text-xl">Growing with your block</h2><div className="space-y-3">{uses.length ? uses.map((entry) => {
      const garden = state.gardens.find((g) => g.garden_id === entry.garden_id);
      return <Card key={entry.use_id} className="space-y-3"><Pill>Garden journal · {entry.usage_date}</Pill><h3 className="font-display text-xl">{garden?.garden_name}</h3><p className="text-xs text-soil-500">{garden?.location}</p><RealMedia photo={entry.photo_url} video={entry.video_url} credit={entry.media_credit} description={entry.update_notes} transcript={entry.video_description} /><p className="text-sm leading-6">{entry.update_notes}</p><p className="text-xs text-soil-500">{entry.compost_used_kg} kg from {entry.batch_id} · {entry.garden_area}</p></Card>;
    }) : <Card>The garden story will appear when compost from your block’s batches is used.</Card>}</div>
    <details className="mt-6 rounded-3xl bg-white p-4"><summary className="cursor-pointer font-semibold">Collection records ({shown.length})</summary><div className="mt-3 space-y-3">{shown.map((c) => <div key={c.collection_id} className="border-t border-soil-100 pt-3 text-sm"><p className="font-semibold">{new Date(c.collection_datetime).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}</p><p>{c.status} · {c.weight_kg} kg collected · {acceptedKg(c)} kg accepted</p><p className="text-xs text-soil-500">{c.weight_method === "estimated" ? "Estimated" : "Weighed"} · {c.destination} · {c.batch_id ?? "No batch"}</p>{c.contamination_notes ? <p className="mt-2 text-xs">{c.contamination_notes}</p> : null}</div>)}</div></details>
    <Card className="mt-4"><h2 className="mb-3 text-sm font-semibold">Precinct contribution · all time</h2><BlockBars rows={state.blocks.map((b) => ({ name: b.block_name, kg: divertedKg(state, b.block_id) }))} /></Card>
    {user ? <RoleNav role={user.role} /> : null}
  </PhoneShell></Guard>;
}
