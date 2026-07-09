"use client";

import { useState } from "react";
import {
  useAdminRegistrations,
  useReviewRegistration,
  type AbonemenRegistration,
} from "@/lib/queries";
import { formatRupiah, formatDateID } from "@/lib/format";
import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { money } from "@/components/admin/cells";
import { apiGet } from "@/lib/api";

interface AdminPackage {
  id: string;
  name: string;
  price: string;
  sessions_per_week: number;
  duration_weeks: number;
}

// Read-only: backend belum punya CRUD paket abonemen (hanya GET + seed).
const packagesConfig: ResourceConfig<AdminPackage> = {
  title: "Paket Abonemen",
  description: "Sumber pilihan pada form registrasi. (read-only — dikelola lewat seed)",
  queryKey: "admin-abonemen-packages",
  list: () => apiGet<AdminPackage[]>("/abonemen/packages"),
  idOf: (r) => r.id,
  columns: [
    { key: "name", label: "Nama" },
    { key: "price", label: "Harga", render: (r) => money(r.price) },
    { key: "sessions_per_week", label: "Sesi/minggu" },
    { key: "duration_weeks", label: "Durasi", render: (r) => `${r.duration_weeks} minggu` },
  ],
};

type Filter = "pending" | "approved" | "rejected" | "all";

const STATUS: Record<AbonemenRegistration["status"], { label: string; cls: string }> = {
  pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Disetujui", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Ditolak", cls: "bg-red-100 text-red-600" },
  cancelled: { label: "Dibatalkan", cls: "bg-ink-900/10 text-ink-700" },
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "pending", label: "Menunggu" },
  { id: "approved", label: "Disetujui" },
  { id: "rejected", label: "Ditolak" },
  { id: "all", label: "Semua" },
];

export default function AdminAbonemenPage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const { data: rows = [], isLoading, isError } = useAdminRegistrations(
    filter === "all" ? undefined : filter,
  );
  const review = useReviewRegistration();

  function onReview(id: string, action: "approve" | "reject") {
    const verb = action === "approve" ? "menyetujui" : "menolak";
    if (window.confirm(`Yakin ${verb} pengajuan ini?`)) review.mutate({ id, action });
  }

  const busyId = review.isPending ? review.variables?.id : undefined;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">
        Registrasi Abonemen
      </h1>
      <p className="mt-2 text-ink-500">Setujui atau tolak pengajuan tarif abonemen tenis.</p>

      {/* Filter */}
      <div className="mt-6 inline-flex flex-wrap gap-1 rounded-full border border-ink-900/10 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
              filter === f.id ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Daftar */}
      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-900/5" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-6 text-center text-sm text-red-600">
          Gagal memuat. Pastikan kamu login sebagai admin.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-ink-900/5 p-8 text-center text-ink-500">
          Tidak ada pengajuan{filter !== "all" ? ` berstatus "${filter}"` : ""}.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((r) => {
            const s = STATUS[r.status] ?? STATUS.pending;
            return (
              <li
                key={r.id}
                className="flex flex-col gap-4 rounded-2xl border border-ink-900/10 bg-white p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{r.full_name}</p>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-ink-500">
                    {r.communication_email} · {r.phone}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    {r.abonemen_packages?.name ?? "Paket"} ·{" "}
                    <span className="text-ink-700">
                      {r.abonemen_packages ? formatRupiah(r.abonemen_packages.price) : "—"}
                    </span>{" "}
                    · diajukan {formatDateID(r.created_at)}
                  </p>
                </div>

                {r.status === "pending" ? (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => onReview(r.id, "approve")}
                      className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-green-700 focus-visible:ring-4 focus-visible:ring-green-600/30 disabled:opacity-50"
                    >
                      {busyId === r.id ? "…" : "Setujui"}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => onReview(r.id, "reject")}
                      className="rounded-full border border-ink-900/15 px-5 py-2 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:border-red-300 hover:text-red-600 focus-visible:ring-4 focus-visible:ring-red-500/20 disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </div>
                ) : (
                  <p className="shrink-0 text-sm text-ink-400">
                    {r.reviewed_at ? `Direview ${formatDateID(r.reviewed_at)}` : "—"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-14">
        <AdminResource config={packagesConfig} />
      </div>
    </div>
  );
}
