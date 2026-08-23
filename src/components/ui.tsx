"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-terracotta text-white hover:bg-terracotta-dark",
        variant === "secondary" && "border border-ink/15 bg-white text-ink hover:border-ink/40",
        variant === "ghost" && "text-ink/70 hover:bg-ink/5 hover:text-ink",
        variant === "danger" && "bg-rose-700 text-white hover:bg-rose-800",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-terracotta text-white hover:bg-terracotta-dark",
        variant === "secondary" && "border border-ink/15 bg-white text-ink hover:border-ink/40",
        variant === "ghost" && "text-ink/70 hover:bg-ink/5 hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-ink/80">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-sage";

export function StatusBadge({ status }: { status?: string | null }) {
  const value = (status ?? "unknown").toLowerCase();
  const tone =
    value.includes("deliver") || value.includes("approv") || value.includes("paid") || value.includes("success") || value.includes("active")
      ? "bg-sage/15 text-sage"
      : value.includes("pend") || value.includes("process")
        ? "bg-amber-100 text-amber-800"
        : value.includes("reject") || value.includes("fail") || value.includes("cancel")
          ? "bg-rose-100 text-rose-800"
          : "bg-ink/8 text-ink/70";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", tone)}>
      {status ?? "unknown"}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      {message}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-ink/50">Loading…</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink/60">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink/50">{hint}</p> : null}
    </div>
  );
}

export function Table({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: ReactNode[][];
  empty?: ReactNode;
}) {
  if (rows.length === 0) return <>{empty}</>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-ink/10 bg-paper-dark/60 text-xs uppercase tracking-wide text-ink/50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-ink/6 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-middle text-ink/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
