"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, ButtonLink, EmptyState, PageHeader, Spinner, Table } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { availableStock, formatMoney, lowestPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function SellerProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api<Product[]>("/products/my-products", { token })
      .then((data) => setProducts(asList(data)))
      .finally(() => setLoading(false));
  }, [token]);

  async function remove(id: string) {
    if (!token || !confirm("Delete this product?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE", token });
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  return (
    <>
      <PageHeader
        title="Your catalog"
        description="GET /products/my-products — only this shop's listings."
        actions={<ButtonLink href="/seller/products/new">Add product</ButtonLink>}
      />
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <Table
            headers={["Title", "Price", "Stock", ""]}
            empty={<EmptyState title="No listings" body="Create a product with at least one variant." />}
            rows={products.map((product) => [
              <Link key={product.id} href={`/products/${product.id}`} className="font-medium text-terracotta">
                {product.title}
              </Link>,
              formatMoney(lowestPrice(product)),
              String(availableStock(product)),
              <Button key={`${product.id}-del`} variant="ghost" onClick={() => remove(product.id)}>
                Delete
              </Button>,
            ])}
          />
        )}
      </div>
    </>
  );
}
