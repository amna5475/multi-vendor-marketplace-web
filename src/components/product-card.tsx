"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { availableStock, brandName, categoryName, formatMoney, lowestPrice, primaryImage } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const image = primaryImage(product);
  const price = lowestPrice(product);
  const stock = availableStock(product);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-0.5 hover:border-ink/25"
    >
      <div className="relative aspect-[4/5] bg-paper-dark">
        {image ? (
          <Image src={image} alt={product.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="grid h-full place-items-center bg-sage/10 font-display text-5xl text-sage/50">
            {product.title.slice(0, 1)}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[11px] font-medium text-ink/70">
          {categoryName(product)}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-ink/40">{brandName(product) || "Independent"}</p>
        <h3 className="mt-1 line-clamp-2 font-medium text-ink group-hover:text-terracotta">
          {product.title}
        </h3>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-xl text-ink">{formatMoney(price)}</p>
          <p className="text-xs text-ink/45">{stock} in stock</p>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
