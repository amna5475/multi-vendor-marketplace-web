"use client";

import { useEffect, useState } from "react";
import { ButtonLink, PageHeader, Spinner, StatCard } from "@/components/ui";
import { api, asList } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { AdminLog, Product, Seller } from "@/lib/types";

export default function AdminHomePage() {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api<Seller[]>("/sellers", { token }),
      api<Product[]>("/products"),
      api<AdminLog[] | { rows?: AdminLog[] }>("/admin/logs", { token }),
    ])
      .then(([sellerData, productData, logData]) => {
        setSellers(asList(sellerData));
        setProducts(asList(productData));
        setLogs(asList(logData));
      })
      .finally(() => setLoading(false));
  }, [token]);

  const pending = sellers.filter((seller) => (seller.status ?? "").toLowerCase() === "pending").length;

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader
        eyebrow="Marketplace control"
        title="Admin overview"
        description="Approve sellers, manage catalog taxonomy, run campaigns, and inspect audit logs."
        actions={<ButtonLink href="/admin/sellers">Review sellers</ButtonLink>}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Sellers" value={String(sellers.length)} hint={`${pending} awaiting approval`} />
        <StatCard label="Public products" value={String(products.length)} />
        <StatCard label="Audit events" value={String(logs.length)} />
      </div>
    </>
  );
}
