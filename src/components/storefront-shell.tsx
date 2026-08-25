"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { API_DOCS_URL, API_HEALTH_URL, API_REPO_URL } from "@/lib/site";
import { cn } from "./ui";

const links = [
  { href: "/products", label: "Catalog" },
  { href: "/account/orders", label: "Orders" },
];

export function StorefrontHeader() {
  const pathname = usePathname();
  const { user, logout, homeForRole } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight text-ink">Souk</span>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-ink/45 sm:inline">
            Marketplace
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hover:text-terracotta",
                pathname.startsWith(link.href) ? "text-terracotta" : "text-ink/70",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative rounded-full border border-ink/10 px-3 py-1.5 text-sm text-ink/80 hover:border-ink/30"
          >
            Cart
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            ) : null}
          </Link>
          {user ? (
            <>
              {(user.role === "seller" || user.role === "seller_staff" || user.role === "admin") && (
                <Link
                  href={homeForRole(user.role)}
                  className="hidden rounded-full px-3 py-1.5 text-sm text-ink/70 hover:bg-ink/5 sm:inline"
                >
                  {user.role === "admin" ? "Admin" : "Seller"}
                </Link>
              )}
              <Link
                href="/account/orders"
                className="hidden max-w-32 truncate text-sm text-ink/70 sm:inline"
              >
                {user.full_name}
              </Link>
              <button
                onClick={logout}
                className="rounded-full px-3 py-1.5 text-sm text-ink/60 hover:bg-ink/5"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-1.5 text-sm text-ink/70">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-ink px-3 py-1.5 text-sm text-paper hover:bg-ink/90"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-paper/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-paper">Souk</p>
          <p className="mt-2 max-w-xs text-sm text-paper/60">
            Multi-vendor marketplace frontend for the Node.js + PostgreSQL API —
            customer, seller, and admin in one product.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-paper">Shop</p>
          <div className="mt-2 grid gap-1 text-paper/60">
            <Link href="/products">All products</Link>
            <Link href="/register">Create account</Link>
            <Link href="/account/become-seller">Sell on Souk</Link>
          </div>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-paper">Engineering</p>
          <div className="mt-2 grid gap-1 text-paper/60">
            <a href={API_REPO_URL}>REST API</a>
            {API_DOCS_URL ? <a href={API_DOCS_URL}>Swagger</a> : null}
            {API_HEALTH_URL ? <a href={API_HEALTH_URL}>API health</a> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <StorefrontHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
