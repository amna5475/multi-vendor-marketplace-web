"use client";

import { DashboardShell, RoleGate } from "@/components/dashboard-shell";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/logs", label: "Audit logs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["admin"]}>
      <DashboardShell title="Admin" nav={nav}>
        {children}
      </DashboardShell>
    </RoleGate>
  );
}
