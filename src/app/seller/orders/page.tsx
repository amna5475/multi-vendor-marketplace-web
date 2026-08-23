"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, PageHeader, Spinner, StatusBadge, Table, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function SellerOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api<Order[]>("/orders/seller-orders", { token })
      .then((data) => setOrders(asList(data)))
      .finally(() => setLoading(false));
  }, [token]);

  async function updateStatus(id: string, status: string) {
    if (!token) return;
    try {
      const updated = await api<Order>(`/orders/${id}/status`, { method: "PUT", token, body: { status } });
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status: updated.status } : order)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not update status.");
    }
  }

  async function ship(orderId: string) {
    if (!token) return;
    try {
      await api("/shipments", {
        method: "POST",
        token,
        body: { orderId },
      });
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not create shipment.");
    }
  }

  return (
    <>
      <PageHeader title="Shop orders" description="GET /orders/seller-orders — items sold from this shop." />
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <Table
            headers={["Order", "Placed", "Total", "Status", "Fulfill"]}
            empty={<EmptyState title="No shop orders" body="Orders appear after customers buy your variants." />}
            rows={orders.map((order) => [
              order.order_number,
              formatDate(order.placed_at),
              formatMoney(order.total_amount),
              <StatusBadge key={`${order.id}-st`} status={order.status} />,
              <form
                key={`${order.id}-f`}
                className="flex flex-wrap items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const status = String(form.get("status"));
                  updateStatus(order.id, status);
                  if (status === "shipped") ship(order.id);
                }}
              >
                <select className={inputClass} name="status" defaultValue={order.status}>
                  {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Button type="submit" variant="secondary">Update</Button>
              </form>,
            ])}
          />
        )}
      </div>
    </>
  );
}
