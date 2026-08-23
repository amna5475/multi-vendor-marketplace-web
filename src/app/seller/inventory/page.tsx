"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, EmptyState, ErrorBanner, Field, PageHeader, Spinner, Table, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { variantLabel } from "@/lib/format";
import type { Product, ProductVariant } from "@/lib/types";

export default function InventoryPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<ProductVariant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    if (!token) return;
    Promise.all([
      api<Product[]>("/products/my-products", { token }),
      api<ProductVariant[]>("/inventory/low-stock", { token }),
    ])
      .then(([productData, low]) => {
        setProducts(asList(productData));
        setLowStock(asList(low));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load inventory."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const variants = products.flatMap((product) =>
    (product.product_variants ?? []).map((variant) => ({ ...variant, productTitle: product.title })),
  );

  async function adjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    try {
      await api("/inventory/adjust", {
        method: "POST",
        token,
        body: {
          variant_id: String(form.get("variant_id")),
          quantity_change: Number(form.get("quantity_change")),
          action: "MANUAL_ADJUST",
        },
      });
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Adjustment failed.");
    }
  }

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Low-stock alert at 5 units. Adjustments write an inventory history row on the API."
      />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      <p className="mt-4 text-sm text-ink/55">{lowStock.length} variant(s) at or below the low-stock threshold.</p>
      <form onSubmit={adjust} className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-3">
        <Field label="Variant">
          <select className={inputClass} name="variant_id" required>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.productTitle} · {variantLabel(variant)} ({variant.stock_qty})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity change">
          <input className={inputClass} name="quantity_change" type="number" required placeholder="+5 or -2" />
        </Field>
        <div className="flex items-end">
          <Button type="submit">Adjust stock</Button>
        </div>
      </form>
      <div className="mt-6">
        <Table
          headers={["Product", "Variant", "SKU", "On hand"]}
          empty={<EmptyState title="No variants" body="Create a listing first." />}
          rows={variants.map((variant) => [
            variant.productTitle,
            variantLabel(variant),
            variant.sku ?? "—",
            String(variant.stock_qty),
          ])}
        />
      </div>
    </>
  );
}
