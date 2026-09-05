"use client";

import { useState } from "react";
import AdminTable from "@/components/admin/AdminTable";
import { money, pill } from "@/components/admin/cells";
import { SubjectCell } from "@/components/admin/expiry";
import { formatDateID, formatTimeISO } from "@/lib/format";
import { useAllBookings, type AdminBooking } from "@/lib/queries";

const BOOKING_STATUS = [
  "",
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
];

const inputCls =
  "rounded-xl border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-neon-purple";

/**
 * Daftar booking insidentil untuk satu cabang olahraga.
 * Dipakai halaman "Insidentil Tenis" & "Insidentil Padel" — keduanya hanya
 * berbeda pada `courtType` + judul, jadi tabel & filternya dibagikan di sini.
 */
export default function InsidentilList({
  courtType,
  title,
  description,
}: {
  /** Nilai enum court_type di backend: "tennis" | "paddle" | … */
  courtType: string;
  title: string;
  description: string;
}) {
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const { data: rows = [], isLoading, isError } = useAllBookings({
    courtType,
    bookingType: "insidentil",
    status: status || undefined,
    date: date || undefined,
  });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{title}</h1>
      <p className="mt-2 text-ink-500">{description}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={inputCls}
          aria-label="Filter status"
        >
          {BOOKING_STATUS.map((s) => (
            <option key={s} value={s}>
              {s || "Semua status"}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
          aria-label="Filter tanggal"
        />
        {(status || date) && (
          <button
            type="button"
            onClick={() => {
              setStatus("");
              setDate("");
            }}
            className="rounded-xl px-3 py-2 text-sm font-medium text-ink-500 outline-none transition-colors hover:text-ink-900"
          >
            Reset
          </button>
        )}
      </div>

      <AdminTable<AdminBooking>
        idOf={(r) => r.id}
        loading={isLoading}
        isError={isError}
        rows={rows}
        emptyText="Tidak ada booking insidentil pada filter ini."
        columns={[
          { key: "subject", label: "Subject", render: (r) => <SubjectCell u={r.users} /> },
          {
            key: "court",
            label: "Lapangan",
            render: (r) => (
              <div>
                <p className="font-medium text-ink-900">{r.courts?.name ?? "—"}</p>
                <p className="text-xs text-ink-400">{r.courts?.code ?? ""}</p>
              </div>
            ),
          },
          { key: "date", label: "Tanggal", render: (r) => formatDateID(r.booking_date) },
          {
            key: "time",
            label: "Jam",
            render: (r) => `${formatTimeISO(r.start_time)}–${formatTimeISO(r.end_time)}`,
          },
          { key: "total", label: "Total", render: (r) => money(r.total_price) },
          { key: "status", label: "Status", render: (r) => pill(r.status) },
        ]}
      />
    </div>
  );
}
