"use client";

import { CompostMark, PeelMark } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { useSoilLoop } from "@/lib/use-soil-loop";

function List({
  title,
  tone,
  description,
  mark,
  items,
}: {
  title: string;
  tone: string;
  description: string;
  mark: React.ReactNode;
  items: string[];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        {mark}
        <div>
          <p className={`text-base font-bold ${tone}`}>{title}</p>
          <p className="mt-0.5 text-xs text-soil-500">{description}</p>
        </div>
      </div>
      <ul className="grid gap-x-3 gap-y-2 border-t border-soil-100 bg-cream-50/70 px-4 py-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm leading-5 text-soil-700">
            <span aria-hidden="true" className={`mt-0.5 font-bold ${tone}`}>{title.startsWith("Yes") ? "✓" : title.startsWith("No") ? "×" : "·"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function RulesPage() {
  const { user, block, bin } = useSoilLoop();

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title="What can I compost?" back="/resident" />
        <section className="relative mb-5 overflow-hidden rounded-3xl bg-leaf-800 p-5 text-white shadow-sm">
          <div className="absolute -right-3 -top-4 opacity-90" aria-hidden="true">
            <CompostMark className="h-28 w-28" />
          </div>
          <div className="relative max-w-[72%]">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-leaf-100">Your sorting guide</span>
            <h2 className="mt-3 font-display text-2xl leading-tight">Good scraps, better soil.</h2>
            <p className="mt-2 text-xs leading-5 text-white/80">A quick guide for cleaner compost and happier gardens.</p>
          </div>
          <div className="relative mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5">
            <PeelMark className="h-9 w-9 shrink-0" />
            <p className="text-xs leading-5 text-white/90">
              For <strong>{block?.block_name}</strong> · Partner: <strong>{block?.assigned_compost_site}</strong>
            </p>
          </div>
          <p className="relative mt-2 text-[10px] text-white/60">These instructions are for your block programme.</p>
        </section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-xl text-soil-900">Know before you toss</h2>
          <Pill>Starter list</Pill>
        </div>
        <div className="space-y-3">
          <List title="Yes — add these" description="Food-waste caddy" tone="text-leaf-800" mark={<span className="grid h-10 w-10 place-items-center rounded-2xl bg-leaf-100 text-lg text-leaf-800">✓</span>} items={bin?.accepted_items ?? []} />
          <List title="Ask first" description="Check with your site partner" tone="text-clay-500" mark={<span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-100 text-lg text-clay-500">?</span>} items={bin?.ask_first_items ?? []} />
          <List title="No — keep these out" description="Put these in general waste" tone="text-soil-800" mark={<span className="grid h-10 w-10 place-items-center rounded-2xl bg-soil-100 text-lg text-soil-800">×</span>} items={bin?.rejected_items ?? []} />
          <Card className="border border-leaf-100 bg-gradient-to-br from-white to-leaf-100/60">
            <div className="flex items-center gap-3">
              <CompostMark className="h-11 w-11 shrink-0" />
              <div>
                <p className="font-semibold text-soil-900">Before you drop off</p>
                <p className="text-xs text-soil-500">Small steps make a cleaner batch.</p>
              </div>
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-soil-700">
              <li className="flex gap-2"><span className="text-leaf-700">01</span> Remove packaging, stickers and rubber bands</li>
              <li className="flex gap-2"><span className="text-leaf-700">02</span> Drain liquids — no soup, oil or gravy</li>
              <li className="flex gap-2"><span className="text-leaf-700">03</span> Keep your caddy covered; chill scraps overnight</li>
              <li className="flex gap-2"><span className="text-leaf-700">04</span> If unsure, leave it out and ask your partner</li>
            </ul>
          </Card>
        </div>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
