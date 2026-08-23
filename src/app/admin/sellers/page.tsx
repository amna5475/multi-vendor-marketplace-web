"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, EmptyState, ErrorBanner, Field, PageHeader, Spinner, StatusBadge, Table, inputClass } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Seller } from "@/lib/types";

export default function AdminSellersPage() {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function reload() {
    if (!token) return;
    api<Seller[]>("/sellers", { token })
      .then((data) => setSellers(asList(data)))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load sellers."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function approve(id: string) {
    if (!token) return;
    try {
      await api(`/sellers/${id}/approve`, { method: "PUT", token });
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Approve failed.");
    }
  }

  async function reject(id: string, reason: string) {
    if (!token) return;
    try {
      await api(`/sellers/${id}/reject`, { method: "PUT", token, body: { reason } });
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reject failed.");
    }
  }

  async function createSettlement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const gross = Number(form.get("gross_amount"));
    const commission = Number(form.get("commission"));
    try {
      await api("/settlements", {
        method: "POST",
        token,
        body: {
          seller_id: String(form.get("seller_id")),
          gross_amount: gross,
          commission,
          net_amount: gross - commission,
          status: "pending",
          period_start: String(form.get("period_start")),
          period_end: String(form.get("period_end")),
        },
      });
      alert("Settlement created.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Settlement failed.");
    }
  }

  return (
    <>
      <PageHeader title="Seller applications" description="Approve or reject shops. Approval is written to admin audit logs." />
      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <Table
            headers={["Shop", "Status", "Actions"]}
            empty={<EmptyState title="No sellers" body="Customers apply from /account/become-seller." />}
            rows={sellers.map((seller) => [
              <div key={seller.id}>
                <p className="font-medium">{seller.shop_name}</p>
                <p className="text-xs text-ink/50">{seller.ntn_number}</p>
              </div>,
              <StatusBadge key={`${seller.id}-st`} status={seller.status} />,
              <div key={`${seller.id}-a`} className="flex gap-2">
                <Button variant="secondary" onClick={() => approve(seller.id)}>Approve</Button>
                <Button variant="ghost" onClick={() => reject(seller.id, "Does not meet KYC requirements")}>
                  Reject
                </Button>
              </div>,
            ])}
          />
        )}
      </div>
      <form onSubmit={createSettlement} className="mt-8 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
        <h2 className="font-display text-2xl sm:col-span-2">Create settlement</h2>
        <Field label="Seller">
          <select className={inputClass} name="seller_id" required>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.shop_name}</option>
            ))}
          </select>
        </Field>
        <Field label="Gross"><input className={inputClass} name="gross_amount" type="number" required /></Field>
        <Field label="Commission"><input className={inputClass} name="commission" type="number" required /></Field>
        <Field label="Period start"><input className={inputClass} name="period_start" type="date" required /></Field>
        <Field label="Period end"><input className={inputClass} name="period_end" type="date" required /></Field>
        <div className="sm:col-span-2">
          <Button type="submit">Record payout</Button>
        </div>
      </form>
    </>
  );
}
