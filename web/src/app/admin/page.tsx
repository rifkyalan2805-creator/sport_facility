"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useAdminSummary } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

// Recharts akses DOM → hindari SSR.
const RevenueChart = dynamic(() => import("@/components/admin/RevenueChart"), { ssr: false });

function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink-900">{value}</p>
      {hint && <p className="mt-2 text-sm font-medium text-neon-purple">{hint}</p>}
    </>
  );
  const cls =
    "rounded-2xl border border-ink-900/10 bg-white p-6 outline-none transition-colors duration-200";
  return href ? (
    <Link href={href} className={`${cls} hover:border-ink-900/25 focus-visible:ring-4 focus-visible:ring-neon-purple/30`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default function AdminOverview() {
  const { data: s, isLoading, isError } = useAdminSummary();
  const v = (n?: number) => (isLoading ? "…" : String(n ?? 0));

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">Overview</h1>

      {isError && (
        <p className="mt-6 rounded-2xl bg-red-50 p-6 text-sm text-red-600">
          Gagal memuat ringkasan. Pastikan login sebagai admin.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Booking hari ini" value={v(s?.bookingsToday)} href="/admin/transaksi" />
        <Stat
          label="Registrasi menunggu"
          value={v(s?.pendingAbonemen)}
          hint="Tinjau →"
          href="/admin/abonemen"
        />
        <Stat
          label="Total revenue (lunas)"
          value={isLoading ? "…" : formatRupiah(s?.revenueTotal ?? 0)}
        />
        <Stat label="Total booking" value={v(s?.totalBookings)} href="/admin/transaksi" />
      </div>

      <section className="mt-10 rounded-2xl border border-ink-900/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Revenue 7 Hari Terakhir</h2>
          <span className="text-sm text-ink-400">dari pembayaran lunas</span>
        </div>
        <div className="mt-4">
          {isLoading || !s ? (
            <div className="h-72 animate-pulse rounded-xl bg-ink-900/5" />
          ) : (
            <RevenueChart data={s.revenue7d} />
          )}
        </div>
      </section>
    </div>
  );
}
