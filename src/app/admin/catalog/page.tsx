"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, EmptyState, ErrorBanner, PageHeader, Spinner, Table, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Brand, Category } from "@/lib/types";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminCatalogPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    Promise.all([api<Category[]>("/categories"), api<Brand[]>("/brands")])
      .then(([categoryData, brandData]) => {
        setCategories(asList(categoryData));
        setBrands(asList(brandData));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const name = String(new FormData(event.currentTarget).get("name"));
    try {
      const created = await api<Category>("/categories", { method: "POST", token, body: { name, slug: slugify(name) } });
      setCategories((current) => [...current, created]);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create category.");
    }
  }

  async function addBrand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const name = String(new FormData(event.currentTarget).get("name"));
    try {
      const created = await api<Brand>("/brands", { method: "POST", token, body: { name, slug: slugify(name) } });
      setBrands((current) => [...current, created]);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create brand.");
    }
  }

  return (
    <>
      <PageHeader title="Catalog taxonomy" description="Admin-only category and brand management used when sellers create listings." />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      {loading ? <Spinner /> : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section>
            <form onSubmit={addCategory} className="mb-4 flex gap-2">
              <input className={inputClass} name="name" placeholder="New category" required />
              <Button type="submit">Add</Button>
            </form>
            <Table
              headers={["Category", "Slug"]}
              empty={<EmptyState title="No categories" body="Seed the API or add one here." />}
              rows={categories.map((item) => [item.name, item.slug])}
            />
          </section>
          <section>
            <form onSubmit={addBrand} className="mb-4 flex gap-2">
              <input className={inputClass} name="name" placeholder="New brand" required />
              <Button type="submit">Add</Button>
            </form>
            <Table
              headers={["Brand", "Slug"]}
              empty={<EmptyState title="No brands" body="Seed the API or add one here." />}
              rows={brands.map((item) => [item.name, item.slug])}
            />
          </section>
        </div>
      )}
    </>
  );
}
