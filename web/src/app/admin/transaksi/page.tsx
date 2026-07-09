"use client";

import { useState } from "react";
import AdminTable from "@/components/admin/AdminTable";
import { money, pill } from "@/components/admin/cells";
import { formatDateID, formatTimeISO } from "@/lib/format";
import {
  useAllBookings,
  useAllPayments,
  type AdminBooking,
  type AdminPayment,
} from "@/lib/queries";

const BOOKING_STATUS = ["", "pending", "confirmed", "checked_in", "completed", "cancelled"];
const PAYMENT_STATUS = ["", "pending", "paid", "failed", "expired", "refunded"];

const selectCls =
  "rounded-xl border border-ink-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-neon-purple";

function UserCell({ u }: { u?: { full_name: string; email: string } | null }) {
  if (!u) return <span className="text-ink-400">—</span>;
  return (
    <div>
      <p className="font-medium text-ink-900">{u.full_name}</p>
      <p className="text-xs text-ink-400">{u.email}</p>
    </div>
  );
}

export default function AdminTransaksiPage() {
  const [bStatus, setBStatus] = useState("");
  const [bDate, setBDate] = useState("");
  const [pStatus, setPStatus] = useState("");

  const bookings = useAllBookings({ status: bStatus || undefined, date: bDate || undefined });
  const payments = useAllPayments({ status: pStatus || undefined });

  return (
    <div className="space-y-14">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Transaksi</h1>
        <p className="mt-1 text-ink-500">Semua booking &amp; pembayaran dari seluruh pengguna.</p>
      </div>

      {/* Bookings */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink-900">Semua Booking</h2>
          <div className="flex gap-2">
            <select value={bStatus} onChange={(e) => setBStatus(e.target.value)} className={selectCls}>
              {BOOKING_STATUS.map((s) => (
                <option key={s} value={s}>{s || "Semua status"}</option>
              ))}
            </select>
            <input
              type="date"
              value={bDate}
              onChange={(e) => setBDate(e.target.value)}
              className={selectCls}
            />
            {(bStatus || bDate) && (
              <button
                type="button"
                onClick={() => { setBStatus(""); setBDate(""); }}
                className="rounded-xl px-3 py-2 text-sm font-medium text-ink-500 hover:text-ink-900"
              >
                Reset
              </button>
            )}
          </div>
        </div>
        <AdminTable<AdminBooking>
          idOf={(r) => r.id}
          loading={bookings.isLoading}
          isError={bookings.isError}
          rows={bookings.data ?? []}
          emptyText="Tidak ada booking."
          columns={[
            { key: "user", label: "Pengguna", render: (r) => <UserCell u={r.users} /> },
            { key: "court", label: "Lapangan", render: (r) => r.courts?.name ?? "—" },
            { key: "date", label: "Tanggal", render: (r) => formatDateID(r.booking_date) },
            { key: "time", label: "Jam", render: (r) => `${formatTimeISO(r.start_time)}–${formatTimeISO(r.end_time)}` },
            { key: "type", label: "Jenis", render: (r) => pill(r.booking_type) },
            { key: "total", label: "Total", render: (r) => money(r.total_price) },
            { key: "status", label: "Status", render: (r) => pill(r.status) },
          ]}
        />
      </section>

      {/* Payments */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink-900">Semua Pembayaran</h2>
          <select value={pStatus} onChange={(e) => setPStatus(e.target.value)} className={selectCls}>
            {PAYMENT_STATUS.map((s) => (
              <option key={s} value={s}>{s || "Semua status"}</option>
            ))}
          </select>
        </div>
        <AdminTable<AdminPayment>
          idOf={(r) => r.id}
          loading={payments.isLoading}
          isError={payments.isError}
          rows={payments.data ?? []}
          emptyText="Tidak ada pembayaran."
          columns={[
            { key: "user", label: "Pengguna", render: (r) => <UserCell u={r.users} /> },
            { key: "invoice", label: "Invoice", render: (r) => <span className="font-mono text-xs">{r.invoices?.invoice_number ?? "—"}</span> },
            { key: "items", label: "Item", render: (r) => r.payment_items?.length ?? 0 },
            { key: "final", label: "Dibayar", render: (r) => money(r.final_amount) },
            { key: "status", label: "Status", render: (r) => pill(r.status) },
            { key: "date", label: "Tanggal", render: (r) => formatDateID(r.created_at) },
          ]}
        />
      </section>
    </div>
  );
}
