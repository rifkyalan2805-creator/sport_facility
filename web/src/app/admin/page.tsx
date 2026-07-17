"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAdminSummary, useRevenueBreakdown, type RevenueRange } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

// Recharts akses DOM → hindari SSR.
const RevenueTrendChart = dynamic(() => import("@/components/admin/RevenueTrendChart"), {
  ssr: false,
});
const RevenueCompositionChart = dynamic(
  () => import("@/components/admin/RevenueCompositionChart"),
  { ssr: false }
);

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

const RANGES: { key: RevenueRange; label: string }[] = [
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
];

function PeriodToggle({
  range,
  onChange,
}: {
  range: RevenueRange;
  onChange: (r: RevenueRange) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-ink-900/10 bg-ink-900/[0.03] p-1">
      {RANGES.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={range === o.key}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            range === o.key
              ? "bg-white text-ink-900 shadow-sm"
              : "text-ink-400 hover:text-ink-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminOverview() {
  const [range, setRange] = useState<RevenueRange>("7d");
  const { data: s, isLoading, isError } = useAdminSummary();
  const { data: rev, isLoading: revLoading } = useRevenueBreakdown(range);
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

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Analisis Revenue</h2>
          <PeriodToggle range={range} onChange={setRange} />
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-ink-900/10 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">Tren revenue</h3>
              <span className="text-sm text-ink-400">
                {range === "7d" ? "7 hari" : "30 hari"} terakhir · pembayaran lunas
              </span>
            </div>
            <div className="mt-4">
              {revLoading || !rev ? (
                <div className="h-72 animate-pulse rounded-xl bg-ink-900/5" />
              ) : (
                <RevenueTrendChart data={rev.trend} />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-ink-900/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">Uang dari mana</h3>
              <span className="text-sm text-ink-400">komposisi</span>
            </div>
            <div className="mt-4">
              {revLoading || !rev ? (
                <div className="h-64 animate-pulse rounded-xl bg-ink-900/5" />
              ) : (
                <RevenueCompositionChart data={rev.composition} total={rev.total} />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
