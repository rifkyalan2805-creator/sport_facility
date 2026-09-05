"use client";

import { useMemo, useState } from "react";
import AdminTable from "@/components/admin/AdminTable";
import { money, pill } from "@/components/admin/cells";
import {
  ExpiryBadge,
  ExpiryFilter,
  SubjectCell,
  WARNING_DAYS,
} from "@/components/admin/expiry";
import { formatDateID } from "@/lib/format";
import { usePoolMembers, type AdminPoolMember, type ExpiryGroup } from "@/lib/queries";

const inputCls =
  "rounded-xl border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-neon-purple";

export default function AdminMemberKolamPage() {
  const [group, setGroup] = useState<ExpiryGroup | undefined>();
  const [search, setSearch] = useState("");

  const { data: rows = [], isLoading, isError } = usePoolMembers({
    group,
    search: search.trim() || undefined,
  });

  // Hitungan per kelompok hanya bermakna saat filter "Semua" (data belum disaring).
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
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Member Kolam</h1>
      <p className="mt-2 text-ink-500">
        Daftar member kolam beserta status masa berlakunya. Ikon kuning menandai
        pembayaran yang jatuh tempo dalam {WARNING_DAYS} hari, merah sudah kedaluwarsa.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ExpiryFilter value={group} onChange={setGroup} counts={counts} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama panggilan / email / no. kartu"
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

      <AdminTable<AdminPoolMember>
        idOf={(r) => r.id}
        loading={isLoading}
        isError={isError}
        rows={rows}
        emptyText="Tidak ada member kolam pada filter ini."
        columns={[
          { key: "subject", label: "Subject", render: (r) => <SubjectCell u={r.users} /> },
          {
            key: "paket",
            label: "Paket",
            render: (r) => (
              <div>
                <p className="font-medium text-ink-900">{r.membership_plans?.name ?? "—"}</p>
                <p className="text-xs text-ink-400">
                  {r.membership_plans ? money(r.membership_plans.price) : "—"}
                </p>
              </div>
            ),
          },
          {
            key: "kartu",
            label: "No. Kartu",
            render: (r) =>
              r.card_number ? (
                <span className="font-mono text-xs">{r.card_number}</span>
              ) : (
                <span className="text-ink-400">—</span>
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
