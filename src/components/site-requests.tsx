"use client";

import { useState } from "react";
import { Card, PrimaryButton } from "@/components/ui";
import { supportSiteRequest } from "@/lib/store";
import { useSoilLoop } from "@/lib/use-soil-loop";

export function SiteRequests({ filter = "" }: { filter?: string }) {
  const { user, state } = useSoilLoop();
  const [notice, setNotice] = useState("");
  const query = filter.trim().toLowerCase();
  const requests = state.site_requests.filter((request) =>
    `${request.condo_name} ${request.area}`.toLowerCase().includes(query),
  );

  return (
    <section className="mt-5 space-y-3">
      <div>
        <h2 className="font-display text-xl text-soil-900">Condo requests</h2>
        <p className="mt-1 text-xs leading-5 text-soil-500">
          Residents can show interest while their management decides whether to join.
        </p>
      </div>
      {notice ? <p role="status" className="text-xs text-leaf-800">{notice}</p> : null}
      {requests.length ? (
        requests.map((request) => {
          const supported = Boolean(
            user && request.supporter_user_ids.includes(user.user_id),
          );
          const count = request.supporter_user_ids.length;
          return (
            <Card key={request.site_request_id} className="space-y-2">
              <p className="font-semibold">{request.condo_name}</p>
              <p className="text-xs text-soil-500">{request.area}</p>
              <p className="text-sm text-soil-700">
                {count} {count === 1 ? "person is" : "people are"} interested
              </p>
              <PrimaryButton
                disabled={!user || supported}
                onClick={() => {
                  if (!user) return;
                  const result = supportSiteRequest(
                    request.condo_name,
                    request.area,
                    user.user_id,
                  );
                  setNotice(
                    result.added
                      ? `Interest added for ${request.condo_name}.`
                      : "You already support this request.",
                  );
                }}
              >
                {supported ? "You support this request" : "Add my support"}
              </PrimaryButton>
            </Card>
          );
        })
      ) : (
        <Card>
          <p className="text-sm text-soil-600">
            {query ? "No condo requests match this area yet." : "No condo requests yet."}
          </p>
        </Card>
      )}
    </section>
  );
}
