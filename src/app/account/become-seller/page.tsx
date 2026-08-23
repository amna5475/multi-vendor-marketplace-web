"use client";

import { FormEvent, useState } from "react";
import { Button, ErrorBanner, Field, PageHeader, inputClass } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function BecomeSellerPage() {
  const { token, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api("/sellers/register", { method: "POST", token, body });
      setNotice("Application submitted. An admin must approve the shop before you can list products.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit the application.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Sell on Souk"
        description="POST /sellers/register. After an admin approves you, sign in again so the JWT includes seller_id."
      />
      {user?.role === "seller" ? (
        <p className="mt-4 text-sm text-sage">This account already has a seller role.</p>
      ) : null}
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      {notice ? <p className="mt-4 text-sm text-sage">{notice}</p> : null}
      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
        <Field label="Shop name"><input className={inputClass} name="shop_name" required minLength={3} /></Field>
        <Field label="NTN number"><input className={inputClass} name="ntn_number" required /></Field>
        <Field label="Bank name"><input className={inputClass} name="bank_name" required /></Field>
        <Field label="Bank account"><input className={inputClass} name="bank_account" required /></Field>
        <Field label="IBAN"><input className={inputClass} name="bank_iban" required /></Field>
        <Field label="NTN document URL"><input className={inputClass} name="ntn_doc_url" required placeholder="https://" /></Field>
        <Field label="ID card URL"><input className={inputClass} name="id_card_doc_url" required placeholder="https://" /></Field>
        <div className="sm:col-span-2">
          <Field label="Description"><textarea className={inputClass} name="description" rows={3} /></Field>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Apply as seller"}</Button>
        </div>
      </form>
    </>
  );
}
