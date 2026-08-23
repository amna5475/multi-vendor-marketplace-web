"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, Spinner, StatCard, Table } from "@/components/ui";
import { api, asList, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatMoney } from "@/lib/format";
import type { Wallet, WalletTransaction } from "@/lib/types";

export default function WalletPage() {
  const { token } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api<Wallet>("/wallet/me", { token }),
      api<WalletTransaction[]>("/wallet/transactions", { token }),
    ])
      .then(([walletData, txData]) => {
        setWallet(walletData);
        setTransactions(asList(txData));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load wallet."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader title="Wallet" description="GET /wallet/me and /wallet/transactions" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Balance" value={formatMoney(wallet?.balance, wallet?.currency ?? "PKR")} hint={wallet?.is_locked ? "Wallet locked" : "Available"} />
        <StatCard label="Transactions" value={String(transactions.length)} />
      </div>
      <div className="mt-6">
        <Table
          headers={["When", "Type", "Purpose", "Amount", "Status"]}
          empty={<EmptyState title={error ?? "No movements yet"} body="Refunds and wallet payments will appear here." />}
          rows={transactions.map((row) => [
            formatDate(row.created_at),
            row.type,
            row.purpose ?? "—",
            formatMoney(row.amount, wallet?.currency ?? "PKR"),
            row.status ?? "—",
          ])}
        />
      </div>
    </>
  );
}
