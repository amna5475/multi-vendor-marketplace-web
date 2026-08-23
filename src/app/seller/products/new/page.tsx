"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ErrorBanner, Field, PageHeader, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Brand, Category } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    Promise.all([api<Category[]>("/categories"), api<Brand[]>("/brands")]).then(
      ([categoryData, brandData]) => {
        setCategories(asList(categoryData));
        setBrands(asList(brandData));
      },
    );
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const body = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      base_price: Number(form.get("base_price")),
      category_id: String(form.get("category_id")),
      brand_id: String(form.get("brand_id")),
      variants: [
        {
          sku: String(form.get("sku")),
          color: String(form.get("color") || ""),
          size: String(form.get("size") || ""),
          price: Number(form.get("price") || form.get("base_price")),
          stock_qty: Number(form.get("stock_qty")),
        },
      ],
    };
    try {
      await api("/products", { method: "POST", token, body });
      router.push("/seller/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the product.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageHeader title="New listing" description="POST /products with a first variant. Seller ID is taken from the JWT, not the form." />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Title"><input className={inputClass} name="title" required /></Field>
        <Field label="Base price (PKR)"><input className={inputClass} name="base_price" type="number" min={1} required /></Field>
        <Field label="Category">
          <select className={inputClass} name="category_id" required>
            <option value="">Select</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Brand">
          <select className={inputClass} name="brand_id" required>
            <option value="">Select</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description"><textarea className={inputClass} name="description" rows={3} /></Field>
        </div>
        <Field label="SKU"><input className={inputClass} name="sku" required /></Field>
        <Field label="Variant price"><input className={inputClass} name="price" type="number" min={1} /></Field>
        <Field label="Color"><input className={inputClass} name="color" /></Field>
        <Field label="Size"><input className={inputClass} name="size" /></Field>
        <Field label="Stock quantity"><input className={inputClass} name="stock_qty" type="number" min={0} defaultValue={10} required /></Field>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Publish product"}</Button>
        </div>
      </form>
    </>
  );
}
