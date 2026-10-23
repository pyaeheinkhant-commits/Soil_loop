"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

const NAV: Record<Role, { href: string; label: string }[]> = {
  resident: [
    { href: "/resident", label: "Home" },
    { href: "/resident/rules", label: "Rules" },
    { href: "/resident/dropoff", label: "Drop-off" },
    { href: "/resident/checkin", label: "Check in" },
    { href: "/resident/impact", label: "Impact" },
  ],
  collector: [
    { href: "/collector", label: "Collections" },
    { href: "/operator", label: "KPIs" },
  ],
  gardener: [
    { href: "/gardener", label: "Batches" },
    { href: "/gardener/use", label: "Use" },
  ],
  operator: [
    { href: "/operator", label: "Dashboard" },
    { href: "/operator/sites", label: "Community sites" },
  ],
  site_manager: [{ href: "/client-site", label: "My site" }],
  champion: [{ href: "/champion", label: "Bin" }],
};

export function RoleNav({ role }: { role: Role }) {
  const path = usePathname();
  const items = NAV[role];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-soil-100 bg-white/95 px-3 py-2 backdrop-blur">
      <div className="flex justify-around">
        {items.map((item) => {
          const on = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                on ? "bg-leaf-700 text-white" : "text-soil-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
