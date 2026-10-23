"use client";

import { useState } from "react";
import { BinMark } from "@/components/illustrations";
import { RoleNav } from "@/components/role-nav";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { addChampionIssue, updateBinStatus } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";
import type { BinStatus } from "@/lib/types";

export default function ChampionPage() {
  const { user, block, bin, state } = useSoilLoop();
  const [status, setStatus] = useState<BinStatus>(bin?.status ?? "available");
  const [kind, setKind] = useState("contamination");
  const [notes, setNotes] = useState("Some plastic observed.");
  const [saved, setSaved] = useState("");

  return (
    <Guard user={user} allow={["champion"]}>
      <PhoneShell>
        <TopBar user={user} title={`${block?.block_name} bin check`} />
        <div className="mb-4 flex items-center gap-3">
          <BinMark className="h-14 w-14" />
          <p className="text-sm text-soil-600">
            Keep the bin usable. Education first — no household punishment on
            first offence.
          </p>
        </div>
        <Card className="space-y-3">
          <p className="text-xs text-soil-500">{bin?.location_text}</p>
          <p className="text-sm">Next pickup: {block?.collection_schedule}</p>
          <Field label="Bin status">
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as BinStatus)}>
              <option value="available">Available</option>
              <option value="nearly_full">Nearly full</option>
              <option value="full">Full</option>
              <option value="closed">Temporarily closed</option>
            </select>
          </Field>
          <PrimaryButton
            onClick={() => {
              if (!bin) return;
              updateBinStatus(bin.bin_id, status);
              setSaved("Status updated for residents.");
            }}
          >
            Update status
          </PrimaryButton>
        </Card>
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!user || !block || !bin) return;
            addChampionIssue({
              block_id: block.block_id,
              bin_id: bin.bin_id,
              reporter_id: user.user_id,
              kind,
              notes,
            });
            setSaved("Issue logged. Collectors will see the education note.");
          }}
        >
          <Card className="space-y-3">
            <Field label="Report issue">
              <select className={inputClass} value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="contamination">Contamination</option>
                <option value="smell">Smell</option>
                <option value="pests">Pests</option>
                <option value="overflow">Overflow</option>
                <option value="damaged">Damaged bin</option>
              </select>
            </Field>
            <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <PrimaryButton type="submit">Log issue</PrimaryButton>
            {saved ? <p className="text-xs text-leaf-800">{saved}</p> : null}
          </Card>
        </form>
        <div className="mt-3 space-y-2">
          {state.champion_issues.map((issue) => (
            <Card key={issue.issue_id}>
              <p className="text-sm font-semibold capitalize">{issue.kind}</p>
              <p className="text-xs text-soil-500">{issue.notes}</p>
            </Card>
          ))}
        </div>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
