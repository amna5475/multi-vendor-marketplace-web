"use client";

import { DashboardShell, RoleGate } from "@/components/dashboard-shell";

const nav = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/products/new", label: "New listing" },
  { href: "/seller/inventory", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/settlements", label: "Settlements" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["seller", "seller_staff"]}>
      <DashboardShell title="Seller console" nav={nav}>
        {children}
      </DashboardShell>
    </RoleGate>
  );
}
