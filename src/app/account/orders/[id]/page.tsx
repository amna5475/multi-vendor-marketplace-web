"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, ErrorBanner, Field, PageHeader, Spinner, StatusBadge, inputClass } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatMoney, variantLabel } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api<Order>(`/orders/${params.id}`, { token })
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Order not found."));
  }, [params.id, token]);

  async function requestReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !order) return;
    const form = new FormData(event.currentTarget);
    try {
      await api("/returns", {
        method: "POST",
        token,
        body: {
          order_id: order.id,
          order_item_id: String(form.get("order_item_id")),
          reason: String(form.get("reason")),
          description: String(form.get("description")),
        },
      });
      setNotice("Return request submitted.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not request a return.");
    }
  }

  async function leaveReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !order) return;
    const form = new FormData(event.currentTarget);
    const item = order.order_items?.find((row) => row.id === String(form.get("order_item_id")));
    try {
      await api("/reviews", {
        method: "POST",
        token,
        body: {
          product_id: item?.product_variants?.products?.id,
          order_item_id: item?.id,
          rating: Number(form.get("rating")),
          comment: String(form.get("comment")),
        },
      });
      setNotice("Review posted.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not post the review.");
    }
  }

  if (!order) {
    return error ? <ErrorBanner message={error} /> : <Spinner />;
  }

  return (
    <>
      <PageHeader
        eyebrow={order.order_number}
        title="Order detail"
        description="Inspect line items, request a return, or leave a verified-purchase review."
        actions={<StatusBadge status={order.status} />}
      />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      {notice ? <p className="mt-3 text-sm text-sage">{notice}</p> : null}
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {(order.order_items ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b border-ink/8 px-4 py-3 last:border-0">
            <div>
              <p className="font-medium">{item.product_variants?.products?.title ?? "Item"}</p>
              <p className="text-xs text-ink/50">{variantLabel(item.product_variants)} · qty {item.quantity}</p>
            </div>
            <p>{formatMoney(item.subtotal)}</p>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 font-medium">
          <span>Total</span>
          <span>{formatMoney(order.total_amount)}</span>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form onSubmit={requestReturn} className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-2xl">Request a return</h2>
          <Field label="Item">
            <select className={inputClass} name="order_item_id" required>
              {(order.order_items ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product_variants?.products?.title ?? item.id}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reason"><input className={inputClass} name="reason" required /></Field>
          <Field label="Details"><textarea className={inputClass} name="description" rows={2} /></Field>
          <Button type="submit" variant="secondary">Submit return</Button>
        </form>
        <form onSubmit={leaveReview} className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-2xl">Write a review</h2>
          <Field label="Item">
            <select className={inputClass} name="order_item_id" required>
              {(order.order_items ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.product_variants?.products?.title ?? item.id}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rating">
            <select className={inputClass} name="rating" defaultValue="5">
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </Field>
          <Field label="Comment"><textarea className={inputClass} name="comment" rows={2} /></Field>
          <Button type="submit">Publish review</Button>
        </form>
      </div>
    </>
  );
}
