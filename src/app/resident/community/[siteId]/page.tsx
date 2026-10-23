"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { RoleNav } from "@/components/role-nav";
import { Card, Guard, PhoneShell, Pill, PrimaryButton, TopBar } from "@/components/ui";
import { communityVisitCount } from "@/lib/metrics";
import {
  participationModeLabel,
  siteTypeLabel,
  siteVisibilityLabel,
} from "@/lib/site-options";
import { addCommunityVisit } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";

function ItemList({ title, items, accepted }: { title: string; items: string[]; accepted: boolean }) {
  return (
    <Card>
      <p className={`text-sm font-semibold ${accepted ? "text-leaf-800" : "text-soil-800"}`}>
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-soil-700">
        {items.map((item) => <li key={item}>· {item}</li>)}
      </ul>
    </Card>
  );
}

export default function CommunitySitePage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { user, state } = useSoilLoop();
  const [recordedVisit, setRecordedVisit] = useState(false);
  const site = state.community_sites.find((entry) => entry.community_site_id === siteId);
  const visits = user && site ? communityVisitCount(state, user.user_id, site.community_site_id) : 0;

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title={site?.name ?? "Community site"} back="/resident/find" />
        {site ? (
          <>
            <Card className="space-y-3">
              <Pill>
                {site.is_sample ? "Sample demo site" : "Operator configured · local demo"}
              </Pill>
              <p className="text-sm leading-6 text-soil-600">
                You are viewing <strong>{site.name}</strong>, a {siteTypeLabel(site.site_type).toLowerCase()}
                in {site.area}. These are this site&apos;s rules; they do not change the rules
                for your block programme.
              </p>
              <div className="rounded-2xl bg-cream-100 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-leaf-800">Drop-off</p>
                <p className="mt-1 text-sm">{site.schedule}</p>
                <p className="mt-1 text-sm text-soil-600">{site.dropoff_location}</p>
                <p className="mt-2 text-sm leading-5 text-soil-600">{site.dropoff_instructions}</p>
              </div>
              {site.publication_status === "draft" ? (
                <p className="rounded-2xl bg-cream-100 p-3 text-sm text-soil-700">
                  This site is still being set up and is not open for drop-offs yet.
                </p>
              ) : null}
              <p className="text-xs text-soil-500">
                Participation: {participationModeLabel(site.participation_mode)} · Impact view: {siteVisibilityLabel(site.visibility)}
              </p>
              {site.participant_units.length ? (
                <p className="text-xs text-soil-500">For: {site.participant_units.join(", ")}</p>
              ) : null}
              <p className="text-xs text-soil-500">Composting partner: {site.composting_partner}</p>
              {site.reward_note ? <p className="text-xs text-soil-500">Recognition: {site.reward_note}</p> : null}
            </Card>

            <div className="mt-3 space-y-3">
              <ItemList title="Accepted at this site" items={site.accepted_items} accepted />
              <ItemList title="Please do not bring" items={site.rejected_items} accepted={false} />
            </div>

            <Card className="mt-3 space-y-3">
              <p className="font-display text-xl">Your visits here: {visits}</p>
              <p className="text-sm leading-6 text-soil-600">
                This records a visit only. It does not weigh your scraps or add personal
                kilograms to any impact total.
              </p>
              {recordedVisit ? (
                <p role="status" className="text-sm font-semibold text-leaf-800">
                  Visit recorded. Thank you for participating at this community site.
                </p>
              ) : null}
              <PrimaryButton
                disabled={site.publication_status !== "active"}
                onClick={() => {
                  if (!user) return;
                  const visit = addCommunityVisit(user.user_id, site.community_site_id);
                  if (visit) setRecordedVisit(true);
                }}
              >
                I dropped off scraps here
              </PrimaryButton>
            </Card>
          </>
        ) : (
          <Card className="space-y-3">
            <p className="font-semibold">That sample site is unavailable.</p>
            <Link href="/resident/find" className="text-sm font-semibold text-leaf-800">
              Return to the site finder
            </Link>
          </Card>
        )}
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
