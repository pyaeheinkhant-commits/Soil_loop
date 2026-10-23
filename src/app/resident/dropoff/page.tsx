"use client";

import { DropoffScene } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, GhostLink, Guard, PhoneShell, Pill, TopBar } from "@/components/ui";
import { LoopDiagram } from "@/components/visuals";
import { useSoilLoop } from "@/lib/use-soil-loop";
import { ProgrammeMedia } from "@/components/programme-media";

const STATUS: Record<string, string> = {
  available: "Available",
  nearly_full: "Nearly full",
  full: "Full",
  closed: "Temporarily closed",
};

export default function DropoffPage() {
  const { user, block, bin } = useSoilLoop();

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title="Next drop-off" back="/resident" />
        <LoopDiagram active={1} />
        <div className="mt-4 overflow-hidden rounded-3xl">
          <DropoffScene />
        </div>
        <Card className="mt-4 space-y-2">
          <Pill>{STATUS[bin?.status ?? "available"]}</Pill>
          <p className="font-display text-2xl">{block?.dropoff_schedule ?? "Sunday, 8:00 AM–12:00 PM"}</p>
          <p className="text-xs text-soil-500">Collector pickup: {block?.collection_schedule}</p>
          <p className="text-sm text-soil-600">{bin?.location_text}</p>
          <p className="text-xs text-soil-500">
            Use the marked food-waste bin at this location. Keep scraps covered and refrigerated or frozen if stored for more than one day.
          </p>
          <p className="text-sm">
            <strong>Bring:</strong> fruit peels, vegetable scraps, coffee grounds.
          </p>
          <p className="text-sm">
            <strong>Do not bring:</strong> plastic bags, oil, bones.
          </p>
        </Card>
        <div className="mt-4">
          {bin && ["full", "closed"].includes(bin.status) ? <Card>Please keep your scraps chilled and wait for the bin to reopen. Do not leave bags beside it.</Card> : <GhostLink href="/resident/checkin">I&apos;m at the bin — check in</GhostLink>}
        </div>
        <ProgrammeMedia stage="dropoff" />
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
