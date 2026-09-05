"use client";

import Link from "next/link";

/** Judul halaman dashboard — seragam di semua menu. */
export function PageHeading({
  eyebrow = "Dashboard",
  title,
  desc,
  action,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{title}</h1>
        {desc && <p className="mt-2 text-ink-500">{desc}</p>}
      </div>
      {action}
    </header>
  );
}

export function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

/** Placeholder berdenyut selagi data dimuat. */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-900/5" />
      ))}
    </div>
  );
}

export function ErrorState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-red-50 p-6 text-center text-sm text-red-600">{children}</p>
  );
}

export function EmptyState({
  text,
  ctaHref,
  ctaLabel,
}: {
  text: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-900/15 p-8 text-center">
      <p className="text-ink-500">{text}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-3 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neon-pink"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

/** Panel putih standar untuk mengelompokkan konten di dalam halaman. */
export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-ink-900/10 bg-white p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-lg font-semibold text-ink-900">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Sisa hari sampai `endDate`; negatif berarti sudah lewat. */
export function daysUntil(endDate: string): number {
  const [y, m, d] = endDate.slice(0, 10).split("-").map(Number);
  const akhir = new Date(y, m - 1, d).getTime();
  const kini = new Date();
  const hariIni = new Date(kini.getFullYear(), kini.getMonth(), kini.getDate()).getTime();
  return Math.round((akhir - hariIni) / 86_400_000);
}

/** Kalimat masa berlaku yang dipakai bersama kartu membership & abonemen. */
export function sisaBerlaku(endDate: string): string {
  const n = daysUntil(endDate);
  if (n < 0) return `Berakhir ${Math.abs(n)} hari lalu`;
  if (n === 0) return "Berakhir hari ini";
  return `${n} hari lagi`;
}
