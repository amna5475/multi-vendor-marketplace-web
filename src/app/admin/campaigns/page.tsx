"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, EmptyState, ErrorBanner, Field, PageHeader, Spinner, Table, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Campaign, Product } from "@/lib/types";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CampaignsPage() {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api<Campaign[]>("/campaigns/active"), api<Product[]>("/products")])
      .then(([campaignData, productData]) => {
        setCampaigns(asList(campaignData));
        setProducts(asList(productData));
      })
      .finally(() => setLoading(false));
  }, []);

  async function createCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title"));
    try {
      const created = await api<Campaign>("/campaigns", {
        method: "POST",
        token,
        body: {
          title,
          slug: slugify(title),
          banner_url: String(form.get("banner_url") || ""),
          is_active: true,
          start_date: String(form.get("start_date")),
          end_date: String(form.get("end_date")),
        },
      });
      const productId = String(form.get("product_id") || "");
      if (productId) {
        await api(`/campaigns/${created.id}/products`, {
          method: "POST",
          token,
          body: {
            products: [{ product_id: productId, discount_override: Number(form.get("discount_override") || 10) }],
          },
        });
      }
      setCampaigns((current) => [created, ...current]);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create campaign.");
    }
  }

  return (
    <>
      <PageHeader title="Campaigns" description="Time-bound promotions with optional product-level discount overrides." />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      <form onSubmit={createCampaign} className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Title"><input className={inputClass} name="title" required /></Field>
        <Field label="Banner URL"><input className={inputClass} name="banner_url" /></Field>
        <Field label="Start"><input className={inputClass} name="start_date" type="date" required /></Field>
        <Field label="End"><input className={inputClass} name="end_date" type="date" required /></Field>
        <Field label="Attach product">
          <select className={inputClass} name="product_id">
            <option value="">None yet</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Discount override %"><input className={inputClass} name="discount_override" type="number" defaultValue={10} /></Field>
        <div className="sm:col-span-2">
          <Button type="submit">Create campaign</Button>
        </div>
      </form>
      <div className="mt-6">
        {loading ? <Spinner /> : (
          <Table
            headers={["Campaign", "Slug", "Active"]}
            empty={<EmptyState title="No active campaigns" body="Create one above." />}
            rows={campaigns.map((campaign) => [campaign.title, campaign.slug, campaign.is_active ? "Yes" : "No"])}
          />
        )}
      </div>
    </>
  );
}
