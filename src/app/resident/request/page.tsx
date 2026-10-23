"use client";

import { useState, type FormEvent } from "react";
import { RoleNav } from "@/components/role-nav";
import { SiteRequests } from "@/components/site-requests";
import { Card, Field, Guard, PhoneShell, PrimaryButton, TopBar, inputClass } from "@/components/ui";
import { supportSiteRequest } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";

export default function RequestSitePage() {
  const { user } = useSoilLoop();
  const [condoName, setCondoName] = useState("");
  const [area, setArea] = useState("");
  const [notice, setNotice] = useState("");

  function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const result = supportSiteRequest(condoName, area, user.user_id);
    if (!result.siteRequest) {
      setNotice("Enter your condo name and area to continue.");
      return;
    }
    const count = result.siteRequest.supporter_user_ids.length;
    setNotice(
      result.added
        ? `Interest recorded for ${result.siteRequest.condo_name}. ${count} ${count === 1 ? "person is" : "people are"} interested.`
        : `You already support the request for ${result.siteRequest.condo_name}.`,
    );
  }

  return (
    <Guard user={user} allow={["resident"]}>
      <PhoneShell>
        <TopBar user={user} title="Request a Soil Loop" back="/resident/find" />
        <Card>
          <p className="text-sm leading-6 text-soil-600">
            Add your condo to the interest list. Residents with the same condo name and
            area share one request, and each demo resident can support it once.
          </p>
          <form className="mt-4 space-y-3" onSubmit={submitRequest}>
            <Field label="Condo or building name">
              <input
                className={inputClass}
                value={condoName}
                onChange={(event) => setCondoName(event.target.value)}
                autoComplete="organization"
                required
                minLength={2}
              />
            </Field>
            <Field label="Area">
              <input
                className={inputClass}
                value={area}
                onChange={(event) => setArea(event.target.value)}
                autoComplete="address-level2"
                required
                minLength={2}
              />
            </Field>
            {notice ? <p role="status" className="text-xs text-leaf-800">{notice}</p> : null}
            <PrimaryButton type="submit">Request / add my support</PrimaryButton>
          </form>
        </Card>
        <SiteRequests />
        {user ? <RoleNav role={user.role} /> : null}
      </PhoneShell>
    </Guard>
  );
}
