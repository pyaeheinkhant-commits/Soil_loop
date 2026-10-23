"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "@/lib/use-soil-loop";
import type { User } from "@/lib/types";

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-[radial-gradient(1200px_circle_at_20%_-10%,#d7e6d2,transparent_45%),radial-gradient(900px_circle_at_110%_10%,#f6d7c4,transparent_40%),#f4efe6]">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-24 pt-6">
        {children}
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-soil-900/5 ${className}`}>
      {children}
    </section>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-leaf-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-leaf-800">
      {children}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-leaf-700 px-4 py-3.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block w-full rounded-2xl bg-cream-100 px-4 py-3 text-center text-sm font-semibold text-soil-800"
    >
      {children}
    </Link>
  );
}

export function TopBar({
  user,
  title,
  back,
}: {
  user: User | null;
  title: string;
  back?: string;
}) {
  const router = useRouter();
  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        {back ? (
          <button
            type="button"
            onClick={() => router.push(back)}
            className="mb-1 text-xs font-semibold text-leaf-800"
          >
            ← Back
          </button>
        ) : null}
        <h1 className="font-display text-2xl leading-tight text-soil-900">{title}</h1>
        {user ? (
          <p className="text-xs text-soil-500">
            {user.name} · {user.role.replaceAll("_", " ")}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-soil-600 shadow-sm"
      >
        Switch role
      </button>
    </header>
  );
}

export function Guard({
  user,
  allow,
  children,
}: {
  user: User | null;
  allow: User["role"][];
  children: ReactNode;
}) {
  if (!user) {
    return (
      <PhoneShell>
        <Card>
          <p className="mb-3 font-semibold">Sign in to continue</p>
          <GhostLink href="/">Open demo logins</GhostLink>
        </Card>
      </PhoneShell>
    );
  }
  if (!allow.includes(user.role)) {
    return (
      <PhoneShell>
        <Card>
          <p className="mb-3 font-semibold">This screen is for another role.</p>
          <GhostLink href="/">Choose a demo account</GhostLink>
        </Card>
      </PhoneShell>
    );
  }
  return <>{children}</>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-soil-700">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-soil-200 bg-cream-50 px-3 py-2.5 text-sm outline-none focus:border-leaf-600";
