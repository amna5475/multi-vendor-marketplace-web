"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StorefrontShell } from "@/components/storefront-shell";
import { RoleGate } from "@/components/dashboard-shell";
import { cn } from "@/components/ui";

const links = [
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wallet", label: "Wallet" },
  { href: "/account/become-seller", label: "Sell on Souk" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <RoleGate allow={["customer", "seller", "seller_staff", "admin"]}>
      <StorefrontShell>
        <div className="mb-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm",
                pathname.startsWith(link.href) ? "bg-ink text-paper" : "bg-white text-ink/70",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {children}
      </StorefrontShell>
    </RoleGate>
  );
}
