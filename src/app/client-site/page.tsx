"use client";

import { useState, type FormEvent } from "react";
import { RoleNav } from "@/components/role-nav";
import { Card, Field, Guard, PhoneShell, Pill, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { updateManagedClientSite } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";

function lines(items: string[]) {
  return items.join("\n");
}

export default function ClientSiteDashboard() {
  const { user, state } = useSoilLoop();
  const site = user?.client_site_id
    ? state.client_sites.find((candidate) => candidate.client_site_id === user.client_site_id)
    : undefined;
  const [notice, setNotice] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !site) return;
    const data = new FormData(event.currentTarget);
    const schedule = String(data.get("schedule") ?? "").trim();
    const collectionPoint = String(data.get("collectionPoint") ?? "").trim();
    const units = String(data.get("units") ?? "");
    const updated = updateManagedClientSite(site.client_site_id, user.user_id, {
      collection_schedule: schedule,
      collection_point: collectionPoint,
      participant_units: units.split(/[\n,]/).map((unit) => unit.trim()).filter(Boolean),
    });
    setNotice(updated ? "Your source-site setup has been saved on this device." : "This account cannot update that site.");
  }

  return (
    <Guard user={user} allow={["site_manager"]}>
      <PhoneShell>
        <TopBar user={user} title={site?.name ?? "My source site"} />
        {site ? (
          <>
            <Card className="space-y-3 bg-gradient-to-br from-white to-cream-100">
              <Pill>Waste source · {site.client_type.replaceAll("_", " ")}</Pill>
              <h2 className="font-display text-2xl text-soil-900">Your site collection setup</h2>
              <div className="rounded-2xl bg-white/80 p-3"><p className="text-[10px] uppercase tracking-wide text-soil-500">Area</p><p className="mt-1 text-sm font-semibold">{site.area}</p></div>
            </Card>

            <Card className="mt-4 space-y-4">
              <div>
                <h2 className="font-display text-xl">Collection details</h2>
                <p className="mt-1 text-xs leading-5 text-soil-500">Update when and where your site collects food scraps.</p>
              </div>
              <form className="space-y-3" onSubmit={save}>
                <Field label="Collection schedule">
                  <input name="schedule" className={inputClass} required defaultValue={site.collection_schedule} placeholder="Sunday and Wednesday, 6:00 PM" />
                </Field>
                <Field label="Collection point">
                  <input name="collectionPoint" className={inputClass} required defaultValue={site.collection_point} placeholder="Bin room, loading bay, or service area" />
                </Field>
                <Field label="Participating blocks, tenants, or teams">
                  <textarea name="units" className={`${inputClass} min-h-24 resize-y`} defaultValue={lines(site.participant_units)} placeholder="One group per line" />
                </Field>
                {notice ? <p role="status" className="text-xs text-leaf-800">{notice}</p> : null}
                <PrimaryButton type="submit">Save collection details</PrimaryButton>
              </form>
            </Card>
          </>
        ) : (
          <Card className="space-y-2">
            <h2 className="font-semibold">No source site is linked to this account.</h2>
            <p className="text-sm text-soil-600">Ask the programme operator to assign your account to a condo, mall, or other participating organization.</p>
          </Card>
        )}
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
