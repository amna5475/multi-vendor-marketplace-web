"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { StorefrontShell } from "@/components/storefront-shell";
import { Button, EmptyState, ErrorBanner, PageHeader, Spinner, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { brandName, categoryName, formatMoney, primaryImage, variantLabel } from "@/lib/format";
import type { Product, ProductQuestion, ProductVariant, Review } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [variantId, setVariantId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<Product>(`/products/${params.id}`),
      api<Review[]>(`/reviews/product/${params.id}`),
      api<ProductQuestion[]>(`/products/${params.id}/questions`),
    ])
      .then(([productData, reviewData, questionData]) => {
        setProduct(productData);
        setReviews(asList(reviewData));
        setQuestions(asList(questionData));
        setVariantId(productData.product_variants?.[0]?.id ?? "");
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Product could not be loaded."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const selected: ProductVariant | undefined = useMemo(
    () => product?.product_variants?.find((variant) => variant.id === variantId),
    [product, variantId],
  );

  function addToCart() {
    if (!product || !selected) return;
    addItem({
      productId: product.id,
      productTitle: product.title,
      imageUrl: primaryImage(product),
      variantId: selected.id,
      variantLabel: variantLabel(selected),
      unitPrice: Number(selected.price ?? product.base_price),
      stockQty: selected.stock_qty,
    });
    setNotice("Added to cart");
  }

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("Sign in to ask a question.");
      return;
    }
    const form = event.currentTarget;
    const question = String(new FormData(form).get("question"));
    try {
      const created = await api<ProductQuestion>(`/products/${params.id}/ask`, {
        method: "POST",
        token,
        body: { question },
      });
      setQuestions((current) => [created, ...current]);
      form.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit the question.");
    }
  }

  if (loading) {
    return (
      <StorefrontShell>
        <Spinner />
      </StorefrontShell>
    );
  }

  if (!product) {
    return (
      <StorefrontShell>
        <EmptyState title="Product not found" body={error ?? "This listing is missing."} />
      </StorefrontShell>
    );
  }

  const image = primaryImage(product);

  return (
    <StorefrontShell>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-paper-dark">
          {image ? (
            <Image src={image} alt={product.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="grid h-full place-items-center font-display text-7xl text-sage/40">
              {product.title.slice(0, 1)}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-sage">
            {brandName(product)} · {categoryName(product)}
          </p>
          <h1 className="mt-2 font-display text-4xl">{product.title}</h1>
          <p className="mt-4 text-sm leading-6 text-ink/65">{product.description || "No description provided by the seller."}</p>
          <p className="mt-6 font-display text-4xl">{formatMoney(selected?.price ?? product.base_price)}</p>
          {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
          {notice ? <p className="mt-3 text-sm text-sage">{notice}</p> : null}
          <div className="mt-6 grid gap-3">
            <label className="text-sm font-medium">Variant</label>
            <select className={inputClass} value={variantId} onChange={(event) => setVariantId(event.target.value)}>
              {(product.product_variants ?? []).map((variant) => (
                <option key={variant.id} value={variant.id} disabled={variant.stock_qty <= 0}>
                  {variantLabel(variant)} — {variant.stock_qty} left
                </option>
              ))}
            </select>
            <Button onClick={addToCart} disabled={!selected || selected.stock_qty <= 0}>
              {selected && selected.stock_qty <= 0 ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <PageHeader title="Reviews" description="GET /reviews/product/:id" />
          <div className="mt-4 grid gap-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-ink/50">No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                  <p className="text-sm font-medium">{review.users?.full_name ?? "Customer"} · {review.rating}/5</p>
                  <p className="mt-1 text-sm text-ink/65">{review.comment}</p>
                </article>
              ))
            )}
          </div>
        </div>
        <div>
          <PageHeader title="Questions" description="Ask the seller after you sign in." />
          <form onSubmit={askQuestion} className="mt-4 grid gap-3">
            <textarea className={inputClass} name="question" rows={3} placeholder="Is this authentic?" disabled={!user} />
            <Button type="submit" variant="secondary" disabled={!user}>
              {user ? "Submit question" : "Sign in to ask"}
            </Button>
          </form>
          <div className="mt-4 grid gap-3">
            {questions.map((item) => (
              <article key={item.id} className="rounded-2xl border border-ink/10 bg-white p-4 text-sm">
                <p className="font-medium">{item.question}</p>
                <p className="mt-1 text-ink/60">{item.answer ?? "Waiting for the seller."}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
