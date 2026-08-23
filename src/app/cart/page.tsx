"use client";

import Link from "next/link";
import { StorefrontShell } from "@/components/storefront-shell";
import { Button, ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  return (
    <StorefrontShell>
      <PageHeader
        eyebrow="Checkout"
        title="Cart"
        description="Cart is stored in the browser. The API has no cart resource — checkout posts line items to POST /orders."
      />
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            body="Browse the catalog and add a variant. Stock limits come from the product API."
            action={<ButtonLink href="/products">Browse products</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4">
                <div>
                  <Link href={`/products/${item.productId}`} className="font-medium hover:text-terracotta">
                    {item.productTitle}
                  </Link>
                  <p className="text-xs text-ink/50">{item.variantLabel}</p>
                  <p className="mt-1 text-sm">{formatMoney(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={item.stockQty}
                    value={item.quantity}
                    onChange={(event) => setQuantity(item.variantId, Number(event.target.value))}
                    className="w-16 rounded-lg border border-ink/15 px-2 py-1 text-sm"
                  />
                  <Button variant="ghost" onClick={() => removeItem(item.variantId)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/45">Subtotal</p>
            <p className="mt-2 font-display text-3xl">{formatMoney(subtotal)}</p>
            <p className="mt-1 text-xs text-ink/50">Shipping is calculated at PKR 200 on the API.</p>
            <ButtonLink href="/checkout" className="mt-5 w-full">
              Checkout
            </ButtonLink>
          </aside>
        </div>
      )}
    </StorefrontShell>
  );
}
