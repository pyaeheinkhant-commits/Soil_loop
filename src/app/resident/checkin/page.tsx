"use client";

import { useState } from "react";
import { BinMark } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, PrimaryButton, TopBar } from "@/components/ui";
import { LoopDiagram } from "@/components/visuals";
import { checkinCount } from "@/lib/metrics";
import { addCheckin } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function CheckinPage() {
  const { user, block, bin, state } = useSoilLoop();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const blocked = !bin || ["full", "closed"].includes(bin.status);
  const visits = user ? checkinCount(state, user.user_id) : 0;

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title="Check in" back="/resident" />
        <LoopDiagram active={1} />
        <Card className="mt-4 text-center">
          <div className="mx-auto w-fit">
            <BinMark className="h-20 w-20" />
          </div>
          {done ? (
            <>
              <p className="mt-3 font-display text-2xl">You contributed to {block?.block_name}</p>
              <p className="mt-2 text-sm text-soil-600">
                Thanks. Your scraps join the Sunday collection. We do not
                record personal kilograms — the scale happens at the block bin.
              </p>
              <p className="mt-2 text-xs text-soil-500">Check-ins this demo: {visits}</p>
            </>
          ) : (
            <>
              <p className="mt-3 font-display text-2xl">{block?.block_name} food-waste bin</p>
              <p className="mt-1 text-sm text-soil-600">{bin?.location_text}</p>
              <p className="mt-3 text-xs text-soil-500">Manual check-in. QR comes later.</p>
              <div className="mt-4">
                <PrimaryButton
                  disabled={blocked}
                  onClick={() => {
                    if (!user || !block || !bin) return;
                    try { addCheckin(user.user_id, block.block_id, bin.bin_id); setDone(true); }
                    catch (err) { setError(err instanceof Error ? err.message : "Could not save check-in."); }
                  }}
                >
                  I dropped off scraps
                </PrimaryButton>
                {blocked ? <p className="mt-3 text-sm text-soil-600">This bin is full or closed. Keep scraps chilled until it reopens.</p> : null}
                {error ? <p role="alert" className="mt-3 text-sm text-red-800">{error}</p> : null}
              </div>
            </>
          )}
        </Card>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
