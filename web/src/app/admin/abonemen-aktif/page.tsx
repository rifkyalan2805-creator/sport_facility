"use client";

import { useMemo, useState } from "react";
import AdminTable from "@/components/admin/AdminTable";
import { money, pill } from "@/components/admin/cells";
import { ExpiryBadge, ExpiryFilter, SubjectCell } from "@/components/admin/expiry";
import { formatDateID } from "@/lib/format";
import { useActiveAbonemen, type AdminUserAbonemen, type ExpiryGroup } from "@/lib/queries";

const inputCls =
  "rounded-xl border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-neon-purple";

export default function AdminAbonemenAktifPage() {
  const [group, setGroup] = useState<ExpiryGroup | undefined>();
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading, isError } = useActiveAbonemen({
    group,
    search: search.trim() || undefined,
  });

  const counts = useMemo(() => {
    if (group) return undefined;
    return rows.reduce<Partial<Record<ExpiryGroup, number>>>((acc, r) => {
      acc[r.expiry_group] = (acc[r.expiry_group] ?? 0) + 1;
      return acc;
    }, {});
  }, [rows, group]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Abonemen Aktif</h1>
      <p className="mt-2 text-ink-500">
        Abonemen yang sudah berjalan beserta sisa sesinya. Pengajuan yang belum
        disetujui ada di menu <span className="text-ink-700">Registrasi Abonemen</span>.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ExpiryFilter value={group} onChange={setGroup} counts={counts} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama panggilan / email / paket"
          className={`${inputCls} min-w-[16rem] flex-1`}
        />
        {(group || search) && (
          <button
            type="button"
            onClick={() => {
              setGroup(undefined);
              setSearch("");
            }}
            className="rounded-xl px-3 py-2 text-sm font-medium text-ink-500 outline-none transition-colors hover:text-ink-900"
          >
            Reset
          </button>
        )}
      </div>

      <AdminTable<AdminUserAbonemen>
        idOf={(r) => r.id}
        loading={isLoading}
        isError={isError}
        rows={rows}
        emptyText="Belum ada abonemen berjalan. Setujui pengajuan di menu Registrasi Abonemen."
        columns={[
          { key: "subject", label: "Subject", render: (r) => <SubjectCell u={r.users} /> },
          {
            key: "paket",
            label: "Paket",
            render: (r) => (
              <div>
                <p className="font-medium text-ink-900">{r.abonemen_packages?.name ?? "—"}</p>
                <p className="text-xs text-ink-400">
                  {r.abonemen_packages
                    ? `${money(r.abonemen_packages.price)} · ${r.abonemen_packages.sessions_per_week}x/minggu`
                    : "—"}
                </p>
              </div>
            ),
          },
          {
            key: "sisa",
            label: "Sisa Sesi",
            render: (r) => (
              <span
                className={`font-semibold ${
                  r.remaining_sessions === 0 ? "text-red-600" : "text-ink-900"
                }`}
              >
                {r.remaining_sessions}
              </span>
            ),
          },
          { key: "mulai", label: "Mulai", render: (r) => formatDateID(r.start_date) },
          { key: "berakhir", label: "Berakhir", render: (r) => formatDateID(r.end_date) },
          {
            key: "expiry",
            label: "Masa Berlaku",
            render: (r) => <ExpiryBadge group={r.expiry_group} endDate={r.end_date} />,
          },
          { key: "status", label: "Status", render: (r) => pill(r.status) },
        ]}
      />
    </div>
  );
}
