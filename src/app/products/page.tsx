"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/product-card";
import { StorefrontShell } from "@/components/storefront-shell";
import { EmptyState, Field, PageHeader, Spinner, cn, inputClass } from "@/components/ui";
import { api, asList } from "@/lib/api";
import type { Brand, Category, Product } from "@/lib/types";

function Catalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products");
  }

  useEffect(() => {
    Promise.all([api<Product[]>("/products"), api<Category[]>("/categories"), api<Brand[]>("/brands")])
      .then(([productData, categoryData, brandData]) => {
        setProducts(asList(productData));
        setCategories(asList(categoryData));
        setBrands(asList(brandData));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !needle ||
        product.title.toLowerCase().includes(needle) ||
        (product.description ?? "").toLowerCase().includes(needle);
      const matchesCategory = !category || product.category_id === category;
      const matchesBrand = !brand || product.brand_id === brand;
      return matchesQuery && matchesCategory && matchesBrand;
    });
  }, [brand, category, products, query]);

  return (
    <StorefrontShell>
      <PageHeader
        eyebrow="Catalog"
        title="All products"
        description="Public GET /products with client-side search. Filters map onto category and brand IDs from the API."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Field label="Search">
          <input
            className={inputClass}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles"
          />
        </Field>
        <Field label="Category">
          <select className={inputClass} value={category} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Brand">
          <select className={inputClass} value={brand} onChange={(event) => updateFilter("brand", event.target.value)}>
            <option value="">All brands</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className={cn("mt-4 text-sm text-ink/50")}>{filtered.length} products</p>
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing matched" body="Try another search, or add products from a seller account." />
        ) : (
          <ProductGrid products={filtered} />
        )}
      </div>
    </StorefrontShell>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Catalog />
    </Suspense>
  );
}
