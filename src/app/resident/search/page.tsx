"use client";

import { useMemo, useState } from "react";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, TopBar, inputClass } from "@/components/ui";
import { searchWaste } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";
import type { WasteVerdict } from "@/lib/types";

const COPY: Record<WasteVerdict, { label: string; cls: string }> = {
  yes: { label: "Yes", cls: "bg-leaf-100 text-leaf-800" },
  no: { label: "No — general waste", cls: "bg-soil-100 text-soil-800" },
  ask: { label: "Ask first", cls: "bg-orange-100 text-clay-500" },
  packaging: { label: "Remove packaging first", cls: "bg-cream-200 text-soil-800" },
};

export default function SearchPage() {
  const { user, block, state } = useSoilLoop();
  const [q, setQ] = useState("");
  const results = useMemo(() => searchWaste(q, state), [q, state]);

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title="Can I compost this?" back="/resident" />
        <p className="mb-3 text-sm text-soil-600">
          These pilot rules apply to {block?.block_name} and {block?.assigned_compost_site}. Your composting partner has the final say.
        </p>
        <input
          className={inputClass}
          aria-label="Search an item in your block’s compost guide"
          placeholder="Banana peel, oil, bones…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-3 space-y-2">
          {results.map((item) => {
            const tone = COPY[item.verdict];
            return (
              <Card key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{item.name}</p>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone.cls}`}>
                    {tone.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-soil-600">{item.reason}</p>
              </Card>
            );
          })}
          {results.length === 0 ? (
            <Card>
              <p className="text-sm">
                Unsure? Put it in general waste. A contaminated batch is worse
                than a missed peel.
              </p>
            </Card>
          ) : null}
        </div>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
