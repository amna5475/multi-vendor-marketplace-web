"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product-card";
import { StorefrontShell } from "@/components/storefront-shell";
import { ButtonLink, EmptyState, Spinner } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import type { Campaign, Category, Product } from "@/lib/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<Product[]>("/products"),
      api<Category[]>("/categories"),
      api<Campaign[]>("/campaigns/active"),
    ])
      .then(([productData, categoryData, campaignData]) => {
        setProducts(asList(productData).slice(0, 6));
        setCategories(asList(categoryData));
        setCampaigns(asList(campaignData));
      })
      .catch((error: unknown) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "Start the API on localhost:3000 to load live catalog data.";
        setOffline(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <StorefrontShell>
      <section className="overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-paper sm:px-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
          Multi-vendor marketplace
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">
          Independent shops. One checkout. Three role dashboards.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-paper/70 sm:text-base">
          Souk is the Next.js frontend for the Multi-Vendor Ecommerce API —
          catalog, cart, orders, seller inventory, and admin approvals against a
          real Node + PostgreSQL backend.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/products">Browse catalog</ButtonLink>
          <ButtonLink href="/register" variant="secondary" className="border-paper/20 bg-transparent text-paper hover:border-paper/50">
            Create an account
          </ButtonLink>
        </div>
      </section>

      {campaigns.length > 0 ? (
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {campaigns.slice(0, 2).map((campaign) => (
            <Link
              key={campaign.id}
              href={`/products?campaign=${campaign.slug}`}
              className="rounded-2xl border border-ink/10 bg-white p-6 hover:border-terracotta/40"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-sage">Campaign</p>
              <h2 className="mt-1 font-display text-2xl">{campaign.title}</h2>
              <p className="mt-2 text-sm text-ink/55">Time-bound marketplace promotion.</p>
            </Link>
          ))}
        </section>
      ) : null}

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-3xl">Shop by category</h2>
          <Link href="/products" className="text-sm text-terracotta hover:underline">
            View all
          </Link>
        </div>
        {categories.length === 0 && !loading ? (
          <p className="text-sm text-ink/50">Categories appear after the API seeder has run.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm hover:border-ink/30"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-5 font-display text-3xl">Fresh from sellers</h2>
        {loading ? (
          <Spinner />
        ) : offline ? (
          <EmptyState
            title="API is not reachable"
            body={`${offline} Start the marketplace API and confirm API_URL in .env.local (or Vercel env).`}
            action={<ButtonLink href="https://github.com/amna5475/Multi-Vendor-Ecommerce-API">Open the API repo</ButtonLink>}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            body="Seed categories/brands on the API, approve a seller, then add a product from the seller dashboard."
            action={<ButtonLink href="/register">Join as a customer</ButtonLink>}
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </StorefrontShell>
  );
}
