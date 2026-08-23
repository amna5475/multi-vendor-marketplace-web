"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, PageHeader, Spinner, StatusBadge, Table } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api<Order[]>("/orders/my-orders", { token })
      .then((data) => setOrders(asList(data)))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      <PageHeader eyebrow="Account" title="Your orders" description="GET /orders/my-orders" />
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <Table
            headers={["Order", "Placed", "Total", "Status", "Payment"]}
            empty={<EmptyState title={error ?? "No orders yet"} body="Place an order from checkout to see it here." />}
            rows={orders.map((order) => [
              <Link key={order.id} href={`/account/orders/${order.id}`} className="font-medium text-terracotta">
                {order.order_number}
              </Link>,
              formatDate(order.placed_at),
              formatMoney(order.total_amount),
              <StatusBadge key={`${order.id}-s`} status={order.status} />,
              <StatusBadge key={`${order.id}-p`} status={order.payment_status} />,
            ])}
          />
        )}
      </div>
    </>
  );
}
