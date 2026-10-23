"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroLoopScene } from "@/components/illustrations";
import { LoopDiagram } from "@/components/visuals";
import { Card, PhoneShell, PrimaryButton, inputClass } from "@/components/ui";
import { cloneSeed } from "@/lib/seed";
import { loginAs, loginWith } from "@/lib/use-soil-loop";
import { resetState } from "@/lib/store";
import type { Role } from "@/lib/types";

const DEMOS: { role: Role; email: string; blurb: string; label?: string }[] = [
  { role: "resident", email: "resident@soilloop.demo", blurb: "Rules, check-in, block impact" },
  { role: "collector", email: "collector@soilloop.demo", blurb: "Weigh, contamination, batch" },
  { role: "gardener", email: "gardener@soilloop.demo", blurb: "Batch lifecycle and garden use" },
  { role: "operator", email: "operator@soilloop.demo", blurb: "Precinct KPIs" },
  { role: "site_manager", label: "Site Manager", email: "condo.manager@soilloop.demo", blurb: "Collection schedule and participating groups" },
  { role: "champion", email: "champion@soilloop.demo", blurb: "Bin status (optional extra)" },
];

export default function LoginPage() {
  const router = useRouter();
  const users = cloneSeed().users;
  const [email, setEmail] = useState("resident@soilloop.demo");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  return (
    <PhoneShell>
      <h1 className="mt-2 font-display text-4xl leading-none text-soil-900">
        Neighbourhood Soil Loop
      </h1>
      <div className="mt-5 overflow-hidden rounded-3xl">
        <HeroLoopScene />
      </div>
      <div className="mt-4">
        <LoopDiagram />
      </div>

      <Card className="mt-5 space-y-3">
        <p className="text-sm font-semibold">Demo accounts — password demo123</p>
        {DEMOS.map((demo) => {
          const user = users.find((u) => u.email === demo.email);
          return (
            <button
              key={demo.email}
              type="button"
              onClick={() => {
                if (!user) return;
                router.push(loginAs(user));
              }}
              className="flex w-full items-start justify-between rounded-2xl bg-cream-100 px-3 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold capitalize">{demo.label ?? demo.role.replaceAll("_", " ")}</span>
                <span className="text-xs text-soil-500">{demo.email}</span>
              </span>
              <span className="max-w-[45%] text-right text-[11px] text-soil-500">
                {demo.blurb}
              </span>
            </button>
          );
        })}
      </Card>

      <Card className="mt-4 space-y-3">
        <p className="text-sm font-semibold">Or type a login</p>
        <input
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          className={inputClass}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error ? <p className="text-xs text-clay-500">{error}</p> : null}
        <PrimaryButton
          onClick={() => {
            const result = loginWith(email, password);
            if (!result) {
              setError("Unknown demo account.");
              return;
            }
            router.push(result.href);
          }}
        >
          Enter the loop
        </PrimaryButton>
        <button
          type="button"
          className="w-full text-xs text-soil-500"
          onClick={() => {
            resetState();
            setError("");
          }}
        >
          Reset synthetic demo data
        </button>
      </Card>
    </PhoneShell>
  );
}
