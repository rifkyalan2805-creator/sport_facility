"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminResource, { type ResourceConfig } from "@/components/admin/AdminResource";
import { pill } from "@/components/admin/cells";
import { formatDateID, formatTimeISO } from "@/lib/format";
import { apiGet, apiPatch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { useCourts, type WaitingStatus } from "@/lib/queries";

interface AdminWaitingEntry {
  id: string;
  court_id: string;
  preferred_date: string;
  preferred_start: string;
  preferred_end: string;
  status: WaitingStatus;
  notified_at: string | null;
  created_at: string;
  courts?: { name: string; code: string } | null;
  users?: { full_name: string; email: string } | null;
}

const STATUS_LABEL: Record<WaitingStatus, string> = {
  waiting: "Menunggu",
  notified: "Slot tersedia",
  booked: "Berhasil booking",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

/** Tombol notifikasi manual — hanya untuk status 'waiting'. */
function NotifyButton({ entry }: { entry: AdminWaitingEntry }) {
  const qc = useQueryClient();
  const notify = useMutation({
    mutationFn: () => apiPatch(`/waiting-list/${entry.id}/notify`),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) =>
          typeof q.queryKey[0] === "string" && q.queryKey[0].startsWith("admin-waitlist"),
      }),
    onError: (e) => window.alert(getErrorMessage(e)),
  });

  if (entry.status !== "waiting") return <span className="text-ink-300">—</span>;
  return (
    <button
      type="button"
      onClick={() => notify.mutate()}
      disabled={notify.isPending}
      className="font-medium text-neon-purple outline-none transition-colors hover:text-neon-pink disabled:opacity-50"
    >
      {notify.isPending ? "…" : "Notifikasi"}
    </button>
  );
}

export default function AdminWaitlistPage() {
  const { data: courts = [] } = useCourts();
  const [court, setCourt] = useState("");
  const [date, setDate] = useState("");

  const config = useMemo<ResourceConfig<AdminWaitingEntry>>(() => {
    const params = new URLSearchParams();
    if (court) params.set("court_id", court);
    if (date) params.set("date", date);
    const qs = params.toString();
    return {
      title: "Antrean (Waiting List)",
      description:
        "Antrean slot penuh. Notifikasi manual mengubah 'waiting' → 'notified' (berlaku 24 jam). Pembatalan booking otomatis mempromosikan antrean tertua.",
      queryKey: `admin-waitlist:${court}:${date}`,
      emptyText: "Tidak ada antrean untuk filter ini.",
      list: () => apiGet<AdminWaitingEntry[]>(`/waiting-list/all${qs ? `?${qs}` : ""}`),
      idOf: (r) => r.id,
      columns: [
        { key: "court", label: "Lapangan", render: (r) => r.courts?.name ?? "—" },
        {
          key: "user",
          label: "Peserta",
          render: (r) => (
            <div>
              <p className="font-medium text-ink-900">{r.users?.full_name ?? "—"}</p>
              <p className="text-xs text-ink-400">{r.users?.email ?? ""}</p>
            </div>
          ),
        },
        { key: "date", label: "Tanggal", render: (r) => formatDateID(r.preferred_date) },
        {
          key: "time",
          label: "Jam",
          render: (r) => `${formatTimeISO(r.preferred_start)}–${formatTimeISO(r.preferred_end)}`,
        },
        { key: "status", label: "Status", render: (r) => pill(STATUS_LABEL[r.status] ?? r.status) },
        { key: "aksi", label: "Aksi", render: (r) => <NotifyButton entry={r} /> },
      ],
    };
  }, [court, date]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Antrean</h1>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-ink-700">
          Lapangan
          <select
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            className="mt-1 block rounded-xl border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-neon-purple"
          >
            <option value="">Semua lapangan</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-ink-700">
          Tanggal
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block rounded-xl border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-neon-purple"
          />
        </label>
        {(court || date) && (
          <button
            type="button"
            onClick={() => {
              setCourt("");
              setDate("");
            }}
            className="rounded-full border border-ink-900/15 px-4 py-2.5 text-sm font-medium text-ink-600 outline-none transition-colors hover:bg-ink-900/5"
          >
            Reset
          </button>
        )}
      </div>

      <AdminResource config={config} />
    </div>
  );
}
