"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, Spinner, StatusBadge, Table } from "@/components/ui";
import { api, asList } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatMoney } from "@/lib/format";
import type { Settlement } from "@/lib/types";

export default function SettlementsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api<Settlement[]>("/settlements/me", { token })
      .then((data) => setRows(asList(data)))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      <PageHeader
        title="Settlements"
        description="GET /settlements/me — payout records created by an admin for this shop."
      />
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <Table
            headers={["Period", "Gross", "Commission", "Net", "Status"]}
            empty={<EmptyState title="No settlements yet" body="Admins create payout periods from the admin console." />}
            rows={rows.map((row) => [
              `${formatDate(row.period_start)} – ${formatDate(row.period_end)}`,
              formatMoney(row.gross_amount),
              formatMoney(row.commission),
              formatMoney(row.net_amount),
              <StatusBadge key={row.id} status={row.status} />,
            ])}
          />
        )}
      </div>
    </>
  );
}
