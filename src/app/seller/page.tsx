"use client";

import { useEffect, useState } from "react";
import { ButtonLink, PageHeader, Spinner, StatCard } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { availableStock, formatMoney } from "@/lib/format";
import type { Order, Product, Seller } from "@/lib/types";

export default function SellerHomePage() {
  const { token } = useAuth();
  const [shop, setShop] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api<Seller>("/sellers/my-profile", { token }),
      api<Product[]>("/products/my-products", { token }),
      api<Order[]>("/orders/seller-orders", { token }),
    ])
      .then(([shopData, productData, orderData]) => {
        setShop(shopData);
        setProducts(asList(productData));
        setOrders(asList(orderData));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load seller dashboard."))
      .finally(() => setLoading(false));
  }, [token]);

  const units = products.reduce((sum, product) => sum + availableStock(product), 0);

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader
        eyebrow={shop?.shop_name ?? "Shop"}
        title="Seller overview"
        description={error ?? "Role-gated console for catalog, stock, and shop orders."}
        actions={<ButtonLink href="/seller/products/new">New product</ButtonLink>}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Listings" value={String(products.length)} hint={shop?.status ?? "status unknown"} />
        <StatCard label="Units on hand" value={String(units)} />
        <StatCard label="Shop orders" value={String(orders.length)} hint={formatMoney(orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0))} />
      </div>
    </>
  );
}
