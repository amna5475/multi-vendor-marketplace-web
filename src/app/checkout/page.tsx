"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StorefrontShell } from "@/components/storefront-shell";
import { Button, ButtonLink, EmptyState, ErrorBanner, Field, PageHeader, Spinner, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import type { Address, Order } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      return;
    }
    let cancelled = false;
    api<Address[]>("/addresses/me", { token })
      .then((data) => {
        if (!cancelled) setAddresses(asList(data));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load addresses.");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, token]);

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const created = await api<Address>("/addresses", { method: "POST", token, body: data });
      setAddresses((current) => [created, ...current]);
      form.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the address.");
    }
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const order = await api<Order>("/orders", {
        method: "POST",
        token,
        body: {
          address_id: String(form.get("address_id")),
          payment_method: String(form.get("payment_method")),
          notes: String(form.get("notes") || ""),
          items: items.map((item) => ({
            variant_id: item.variantId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          })),
        },
      });
      clear();
      router.push(`/account/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Checkout failed.");
    } finally {
      setPending(false);
    }
  }

  if (!ready || (token && !loaded)) {
    return (
      <StorefrontShell>
        <Spinner />
      </StorefrontShell>
    );
  }

  if (!user) {
    return (
      <StorefrontShell>
        <EmptyState title="Sign in to checkout" body="Orders require a JWT from POST /auth/login." action={<ButtonLink href="/login">Sign in</ButtonLink>} />
      </StorefrontShell>
    );
  }

  if (items.length === 0) {
    return (
      <StorefrontShell>
        <EmptyState title="Cart is empty" body="Add a product before placing an order." action={<ButtonLink href="/products">Catalog</ButtonLink>} />
      </StorefrontShell>
    );
  }

  return (
    <StorefrontShell>
      <PageHeader
        eyebrow="Checkout"
        title="Place order"
        description="Creates an order with inventory decrement on the API. Shipping fee is currently a backend placeholder of PKR 200."
      />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-2xl">Delivery address</h2>
          <form onSubmit={addAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Full name"><input className={inputClass} name="full_name" required defaultValue={user.full_name} /></Field>
            <Field label="Phone"><input className={inputClass} name="phone" required /></Field>
            <Field label="City"><input className={inputClass} name="city" required /></Field>
            <Field label="Street"><input className={inputClass} name="street" required /></Field>
            <Field label="Area"><input className={inputClass} name="area" /></Field>
            <Field label="Postal code"><input className={inputClass} name="postal_code" /></Field>
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary">Save address</Button>
            </div>
          </form>
        </section>
        <form onSubmit={placeOrder} className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between">
                <span>{item.productTitle} × {item.quantity}</span>
                <span>{formatMoney(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between font-medium">
            <span>Items</span>
            <span>{formatMoney(subtotal)}</span>
          </p>
          <Field label="Ship to">
            <select className={inputClass} name="address_id" required>
              <option value="">Select an address</option>
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.full_name} — {address.street}, {address.city}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Payment method">
            <select className={inputClass} name="payment_method" defaultValue="cod">
              <option value="cod">Cash on delivery</option>
              <option value="wallet">Wallet</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea className={inputClass} name="notes" rows={2} />
          </Field>
          <Button type="submit" disabled={pending || addresses.length === 0} className="mt-2 w-full">
            {pending ? "Placing order…" : "Place order"}
          </Button>
        </form>
      </div>
    </StorefrontShell>
  );
}
