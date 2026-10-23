"use client";

import Link from "next/link";
import { useState } from "react";
import { RoleNav } from "@/components/role-nav";
import { SiteRequests } from "@/components/site-requests";
import { Card, Field, Guard, PhoneShell, Pill, TopBar, inputClass } from "@/components/ui";
import { siteTypeLabel } from "@/lib/site-options";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function FindSitePage() {
  const { user, state } = useSoilLoop();
  const [area, setArea] = useState("");
  const query = area.trim().toLowerCase();
  const sites = state.community_sites.filter((site) =>
    site.publication_status === "active" && site.area.toLowerCase().includes(query),
  );

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title="Find a Soil Loop" back="/resident" />
        <Card className="space-y-3">
          <Pill>Sample directory</Pill>
          <p className="text-sm leading-6 text-soil-600">
            Search by area for sites configured in this local demo. Sample entries are
            marked, and operator entries are not published to a live directory. No GPS
            or distance is used.
          </p>
          <Field label="Area">
            <input
              className={inputClass}
              value={area}
              onChange={(event) => setArea(event.target.value)}
              placeholder="Try Taman Seri or Bandar Baru"
            />
          </Field>
        </Card>

        <section className="mt-5 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-xl text-soil-900">Community sites</h2>
            <span className="text-xs text-soil-500">{sites.length} sample {sites.length === 1 ? "site" : "sites"}</span>
          </div>
          {sites.length ? (
            sites.map((site) => (
              <Card key={site.community_site_id} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{site.name}</p>
                    <p className="mt-1 text-xs text-soil-500">{siteTypeLabel(site.site_type)} · {site.area}</p>
                  </div>
                  <Pill>{site.is_sample ? "Sample" : "Operator entry"}</Pill>
                </div>
                <p className="text-sm text-soil-700">Next drop-off: {site.schedule}</p>
                <Link
                  href={`/resident/community/${site.community_site_id}`}
                  className="block rounded-2xl bg-leaf-700 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  View this site
                </Link>
              </Card>
            ))
          ) : (
            <Card className="space-y-3">
              <p className="font-semibold">No sample sites found{area.trim() ? ` for “${area.trim()}”` : ""}.</p>
              <p className="text-sm leading-6 text-soil-600">
                You can still ask your condo to start a Soil Loop. If you know a request
                for this area, add your support below.
              </p>
              <Link
                href="/resident/request"
                className="block rounded-2xl bg-leaf-700 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Request a Soil Loop for my condo
              </Link>
            </Card>
          )}
        </section>

        <SiteRequests filter={area} />
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
