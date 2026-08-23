"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, Spinner, Table } from "@/components/ui";
import { api, asList } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/format";
import type { AdminLog } from "@/lib/types";

export default function AdminLogsPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api<AdminLog[] | { rows?: AdminLog[] }>("/admin/logs", { token })
      .then((data) => setLogs(asList(data)))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="GET /admin/logs — seller approvals and other admin actions recorded by the API."
      />
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <Table
            headers={["When", "Action", "Target", "IP"]}
            empty={<EmptyState title="No audit events" body="Approve or reject a seller to generate a log row." />}
            rows={logs.map((log) => [
              formatDate(log.created_at),
              log.action,
              `${log.target_type ?? "—"} ${log.target_id ?? ""}`.trim(),
              log.ip_address ?? "—",
            ])}
          />
        )}
      </div>
    </>
  );
}
