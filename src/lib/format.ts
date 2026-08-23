import type { Product, ProductVariant } from "./types";

export function formatMoney(amount?: number | null, currency = "PKR") {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function variantLabel(variant?: ProductVariant | null) {
  if (!variant) return "Default";
  return [variant.color, variant.size, variant.sku].filter(Boolean).join(" · ") || "Default";
}

export function primaryImage(product?: Product | null) {
  const images = product?.product_images ?? [];
  const primary = images.find((image) => image.is_primary) ?? images[0];
  return primary?.url ?? product?.product_variants?.[0]?.image_url ?? null;
}

export function lowestPrice(product?: Product | null) {
  const variants = product?.product_variants ?? [];
  if (variants.length === 0) return Number(product?.base_price ?? 0);
  return Math.min(...variants.map((variant) => Number(variant.price ?? product?.base_price ?? 0)));
}

export function availableStock(product?: Product | null) {
  return (product?.product_variants ?? []).reduce(
    (sum, variant) => sum + Number(variant.stock_qty ?? 0),
    0,
  );
}

export function categoryName(product?: Product | null) {
  return product?.categories?.name ?? "Catalog";
}

export function brandName(product?: Product | null) {
  return product?.brands?.name ?? "";
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
