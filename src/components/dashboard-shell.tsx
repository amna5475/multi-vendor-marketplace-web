"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/types";
import { cn, Spinner } from "./ui";

export function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const allowKey = allow.join(",");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allowKey.split(",").includes(user.role)) {
      router.replace("/");
    }
  }, [allowKey, ready, router, user]);

  if (!ready || !user || !allow.includes(user.role)) {
    return <Spinner />;
  }

  return <>{children}</>;
}

export function DashboardShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full bg-paper">
      <div className="mx-auto grid max-w-7xl gap-0 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-ink/10 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4 lg:block">
            <Link href="/" className="font-display text-2xl text-ink">
              Souk
            </Link>
            <p className="hidden text-xs uppercase tracking-[0.18em] text-ink/40 lg:mt-1 lg:block">
              {title}
            </p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-xl px-3 py-2 text-sm",
                  pathname === item.href
                    ? "bg-ink text-paper"
                    : "text-ink/70 hover:bg-ink/5",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden border-t border-ink/10 px-5 py-4 text-sm lg:block">
            <p className="font-medium text-ink">{user?.full_name}</p>
            <p className="capitalize text-ink/50">{user?.role?.replace("_", " ")}</p>
            <button onClick={logout} className="mt-3 text-terracotta hover:underline">
              Sign out
            </button>
          </div>
        </aside>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
