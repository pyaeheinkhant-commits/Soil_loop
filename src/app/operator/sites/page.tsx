"use client";

import { useState, type FormEvent } from "react";
import { RoleNav } from "@/components/role-nav";
import { Card, Field, GhostLink, Guard, PhoneShell, Pill, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { PARTICIPATION_MODES, SITE_TYPES, SITE_VISIBILITIES, participationModeLabel, siteTypeLabel, siteVisibilityLabel } from "@/lib/site-options";
import { saveCommunitySite } from "@/lib/store";
import type { CommunitySite, CommunitySiteType, ParticipationMode, SitePublicationStatus, SiteVisibility } from "@/lib/types";
import { useSoilLoop } from "@/lib/use-soil-loop";

type SiteForm = Omit<CommunitySite, "community_site_id" | "is_sample" | "accepted_items" | "rejected_items" | "participant_units"> & {
  accepted_items: string;
  rejected_items: string;
  participant_units: string;
};

const EMPTY_FORM: SiteForm = {
  name: "",
  site_type: "community_dropoff",
  area: "",
  dropoff_location: "",
  dropoff_instructions: "",
  schedule: "",
  composting_partner: "",
  reward_note: "",
  accepted_items: "",
  rejected_items: "",
  participation_mode: "residents_only",
  participant_units: "",
  visibility: "block",
  publication_status: "draft",
};

function splitItems(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function formFromSite(site: CommunitySite): SiteForm {
  return {
    ...site,
    accepted_items: site.accepted_items.join("\n"),
    rejected_items: site.rejected_items.join("\n"),
    participant_units: site.participant_units.join("\n"),
  };
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <textarea
        className={`${inputClass} min-h-24 resize-y`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </Field>
  );
}

export default function OperatorSitesPage() {
  const { user, state } = useSoilLoop();
  const [form, setForm] = useState<SiteForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const activeCount = state.community_sites.filter((site) => site.publication_status === "active").length;
  const draftCount = state.community_sites.length - activeCount;
  const visibleSites = state.community_sites.filter((site) => {
    const searchText = `${site.name} ${site.area} ${siteTypeLabel(site.site_type)}`.toLowerCase();
    return (statusFilter === "all" || site.publication_status === statusFilter)
      && searchText.includes(query.trim().toLowerCase());
  });

  function update<K extends keyof SiteForm>(key: K, value: SiteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editSite(site: CommunitySite) {
    setEditingId(site.community_site_id);
    setForm(formFromSite(site));
    setNotice(`Editing ${site.name}.`);
    document.getElementById("site-registration")?.scrollIntoView({ behavior: "smooth" });
  }

  function submitSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const acceptedItems = splitItems(form.accepted_items);
    const rejectedItems = splitItems(form.rejected_items);
    if (!acceptedItems.length || !rejectedItems.length) {
      setNotice("Add at least one accepted item and one rejected item for this site.");
      return;
    }
    const saved = saveCommunitySite({
      ...form,
      community_site_id: editingId ?? undefined,
      accepted_items: acceptedItems,
      rejected_items: rejectedItems,
      participant_units: splitItems(form.participant_units),
    });
    setEditingId(saved.community_site_id);
    setForm(formFromSite(saved));
    setNotice(`${saved.name} ${editingId ? "updated" : "registered"} in this local demo.`);
  }

  return (
    <Guard user={user} allow={["operator"]}>
      <PhoneShell>
        <TopBar user={user} title="Community sites" back="/operator" />
        <Card className="space-y-3">
          <Pill>Local operator workspace</Pill>
          <p className="text-sm leading-6 text-soil-600">
            Manage receiving locations that accept and process food waste. Set each
            site&apos;s drop-off schedule, handling instructions, composting partner, and
            accepted materials. Condo and mall requests stay separate from receiving-site records.
          </p>
          <PrimaryButton
            onClick={() => {
              setEditingId(null);
              setForm(EMPTY_FORM);
              setNotice("Ready to register a new site.");
              document.getElementById("site-registration")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Register a receiving site
          </PrimaryButton>
        </Card>

        <section aria-label="Receiving site overview" className="mt-4 grid grid-cols-2 gap-3">
          <Card className="p-3"><p className="text-[11px] uppercase tracking-wide text-soil-500">Active receiving sites</p><p className="mt-1 font-display text-2xl">{activeCount}</p><p className="text-[11px] text-soil-500">Listed for residents</p></Card>
          <Card className="p-3"><p className="text-[11px] uppercase tracking-wide text-soil-500">Draft sites</p><p className="mt-1 font-display text-2xl">{draftCount}</p><p className="text-[11px] text-soil-500">Not accepting drop-offs</p></Card>
          <Card className="p-3"><p className="text-[11px] uppercase tracking-wide text-soil-500">Recorded visits</p><p className="mt-1 font-display text-2xl">{state.community_visits.length}</p><p className="text-[11px] text-soil-500">Visit count only</p></Card>
          <Card className="p-3"><p className="text-[11px] uppercase tracking-wide text-soil-500">Condo interest</p><p className="mt-1 font-display text-2xl">{state.site_requests.length}</p><p className="text-[11px] text-soil-500">Potential source clients</p></Card>
        </section>
        {notice ? <p role="status" className="mt-3 rounded-2xl bg-leaf-100 px-3 py-2 text-xs text-leaf-800">{notice}</p> : null}

        <section className="mt-5 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-xl text-soil-900">Receiving community sites</h2>
            <span className="text-xs text-soil-500">{visibleSites.length} shown</span>
          </div>
          <Field label="Search receiving sites">
            <input className={inputClass} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Site name or area" />
          </Field>
          <div className="flex gap-2" aria-label="Filter receiving sites">
            {(["all", "active", "draft"] as const).map((status) => (
              <button key={status} type="button" aria-pressed={statusFilter === status} onClick={() => setStatusFilter(status)} className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${statusFilter === status ? "bg-leaf-700 text-white" : "bg-white text-soil-600 ring-1 ring-soil-100"}`}>
                {status === "all" ? "All sites" : status}
              </button>
            ))}
          </div>
          {visibleSites.length ? visibleSites.map((site) => (
            <Card key={site.community_site_id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{site.name}</p>
                  <p className="mt-1 text-xs text-soil-500">{siteTypeLabel(site.site_type)} · {site.area}</p>
                </div>
                <Pill>{site.publication_status === "active" ? "Active" : "Draft"}</Pill>
              </div>
              <p className="text-xs text-soil-600">{participationModeLabel(site.participation_mode)} · {siteVisibilityLabel(site.visibility)}</p>
              <p className="text-sm text-soil-700">{site.schedule} · {site.composting_partner}</p>
              <p className="text-xs text-soil-500">{site.participant_units.join(", ") || "No blocks, tenants, or stalls listed"}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-leaf-100 px-2 py-1 text-[10px] text-leaf-800">{site.accepted_items.length} accepted items</span>
                <span className="rounded-full bg-cream-100 px-2 py-1 text-[10px] text-soil-600">{site.rejected_items.length} excluded items</span>
                <span className="rounded-full bg-cream-100 px-2 py-1 text-[10px] text-soil-600">{state.community_visits.filter((visit) => visit.community_site_id === site.community_site_id).length} visits</span>
              </div>
              <button
                type="button"
                onClick={() => editSite(site)}
                className="w-full rounded-2xl bg-cream-100 px-4 py-3 text-sm font-semibold text-soil-800"
              >
                Edit site and rules
              </button>
              <button type="button" onClick={() => {
                saveCommunitySite({
                  community_site_id: site.community_site_id,
                  name: site.name,
                  site_type: site.site_type,
                  area: site.area,
                  dropoff_location: site.dropoff_location,
                  dropoff_instructions: site.dropoff_instructions,
                  schedule: site.schedule,
                  composting_partner: site.composting_partner,
                  reward_note: site.reward_note,
                  accepted_items: site.accepted_items,
                  rejected_items: site.rejected_items,
                  participation_mode: site.participation_mode,
                  participant_units: site.participant_units,
                  visibility: site.visibility,
                  publication_status: site.publication_status === "active" ? "draft" : "active",
                });
                setNotice(`${site.name} is now ${site.publication_status === "active" ? "a draft" : "active in the resident finder"}.`);
              }} className="w-full rounded-2xl border border-soil-100 px-4 py-2.5 text-sm font-semibold text-soil-600">
                {site.publication_status === "active" ? "Pause resident listing" : "Publish in resident finder"}
              </button>
            </Card>
          )) : <Card><p className="text-sm text-soil-600">No receiving sites match the search and status filter.</p></Card>}
        </section>

        <section className="mt-5 space-y-3">
          <div>
            <h2 className="font-display text-xl text-soil-900">Condo interest requests</h2>
            <p className="mt-1 text-xs leading-5 text-soil-500">These are potential waste-source clients, not receiving locations. Review demand before onboarding them to a community site.</p>
          </div>
          {state.site_requests.length ? (
            state.site_requests.map((request) => (
              <Card key={request.site_request_id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{request.condo_name}</p>
                    <p className="text-xs text-soil-500">{request.area}</p>
                  </div>
                  <Pill>{request.supporter_user_ids.length} interested</Pill>
                </div>
                <p className="text-xs text-soil-500">Source-side interest · {request.created_at.slice(0, 10)}</p>
              </Card>
            ))
          ) : (
            <Card><p className="text-sm text-soil-600">No condo interest requests yet.</p></Card>
          )}
        </section>

        <Card id="site-registration" className="mt-5 space-y-4">
          <div>
            <h2 className="font-display text-xl text-soil-900">
              {editingId ? "Edit receiving site" : "Register a receiving site"}
            </h2>
            <p className="mt-1 text-xs leading-5 text-soil-500">
              These rules belong to the receiving site. Condos and malls can participate as
              separate source clients. Enter list items one per line or separated by commas.
            </p>
          </div>

          <form className="space-y-4" onSubmit={submitSite}>
            <Field label="Receiving site name">
              <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} required minLength={2} />
            </Field>
            <Field label="Receiving site type">
              <select className={inputClass} value={form.site_type} onChange={(event) => update("site_type", event.target.value as CommunitySiteType)}>
                {SITE_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Area or locality">
              <input className={inputClass} value={form.area} onChange={(event) => update("area", event.target.value)} required minLength={2} />
            </Field>
            <TextArea label="Communities or groups served (optional)" value={form.participant_units} onChange={(value) => update("participant_units", value)} placeholder="Taman Seri residents\nBandar Baru market stalls" />
            <Field label="Who can bring waste here?">
              <select className={inputClass} value={form.participation_mode} onChange={(event) => update("participation_mode", event.target.value as ParticipationMode)}>
                {PARTICIPATION_MODES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Impact data grouped by">
              <select className={inputClass} value={form.visibility} onChange={(event) => update("visibility", event.target.value as SiteVisibility)}>
                {SITE_VISIBILITIES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Collection or drop-off schedule">
              <input className={inputClass} value={form.schedule} onChange={(event) => update("schedule", event.target.value)} placeholder="Sunday and Wednesday, 6:00 PM" required />
            </Field>
            <Field label="Drop-off point">
              <input className={inputClass} value={form.dropoff_location} onChange={(event) => update("dropoff_location", event.target.value)} required />
            </Field>
            <TextArea label="Drop-off instructions" value={form.dropoff_instructions} onChange={(value) => update("dropoff_instructions", value)} placeholder="Where to leave scraps and who to ask for" />
            <TextArea label="Accepted items" value={form.accepted_items} onChange={(value) => update("accepted_items", value)} placeholder="Fruit and vegetable scraps\nCoffee grounds" />
            <TextArea label="Rejected items" value={form.rejected_items} onChange={(value) => update("rejected_items", value)} placeholder="Plastic packaging\nOil and liquids" />
            <Field label="Composting partner">
              <input className={inputClass} value={form.composting_partner} onChange={(event) => update("composting_partner", event.target.value)} required />
            </Field>
            <Field label="Resident recognition or reward (optional)">
              <input className={inputClass} value={form.reward_note} onChange={(event) => update("reward_note", event.target.value)} placeholder="For example: garden credit or tenant recognition" />
            </Field>
            <Field label="Directory status">
              <select className={inputClass} value={form.publication_status} onChange={(event) => update("publication_status", event.target.value as SitePublicationStatus)}>
                <option value="draft">Draft — not open for drop-offs</option>
                <option value="active">Active in this demo directory</option>
              </select>
            </Field>

            <PrimaryButton type="submit">{editingId ? "Save site changes" : "Register site"}</PrimaryButton>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setNotice("Changes cancelled. Start a new site or choose another to edit.");
                }}
                className="w-full rounded-2xl bg-cream-100 px-4 py-3 text-sm font-semibold text-soil-800"
              >
                Cancel editing
              </button>
            ) : null}
          </form>
        </Card>

        <div className="mt-4"><GhostLink href="/operator">Back to KPI dashboard</GhostLink></div>
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
