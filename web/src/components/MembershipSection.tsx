"use client";

import Link from "next/link";
import { useMembershipPlans, type MembershipPlan } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

const Check = () => (
  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0 fill-neon-purple" aria-hidden>
    <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z" />
  </svg>
);

function PlanCard({ plan }: { plan: MembershipPlan }) {
  const popular = plan.slug === "gold";
  return (
    <article
      className={`relative flex flex-col rounded-2xl p-6 ${
        popular
          ? "bg-ink-900 text-white shadow-xl shadow-ink-900/20"
          : "border border-ink-900/10 bg-white text-ink-900"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue px-3 py-1 text-xs font-semibold text-white">
          Terpopuler
        </span>
      )}
      <h3 className={`text-lg font-semibold ${popular ? "text-white" : "text-ink-900"}`}>
        {plan.name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold">{formatRupiah(plan.price)}</span>
        <span className={`text-sm ${popular ? "text-white/60" : "text-ink-400"}`}>
          /{plan.duration_days} hari
        </span>
      </div>
      {Number(plan.discount_percent) > 0 && (
        <p className={`mt-1 text-xs ${popular ? "text-neon-pink" : "text-neon-purple"}`}>
          Diskon {Number(plan.discount_percent)}% booking
        </p>
      )}
      <ul className="mt-5 space-y-2.5">
        {plan.benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check />
            <span className={popular ? "text-white/80" : "text-ink-500"}>{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/membership/daftar"
        className={`mt-6 cursor-pointer rounded-full px-5 py-3 text-center text-sm font-semibold transition-colors duration-200 ${
          popular
            ? "bg-white text-ink-900 hover:bg-white/90"
            : "bg-ink-900 text-white hover:bg-ink-700"
        }`}
      >
        Pilih Paket
      </Link>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-2xl border border-ink-900/10 p-6">
          <div className="h-5 w-1/2 animate-pulse rounded bg-ink-900/10" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-ink-900/10" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-ink-900/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-ink-900/10" />
          </div>
          <div className="h-10 w-full animate-pulse rounded bg-ink-900/10" />
        </div>
      ))}
    </div>
  );
}

export default function MembershipSection() {
  const { data, isLoading, isError } = useMembershipPlans();

  return (
    <section id="membership" className="bg-white px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
            Membership
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Pilih paket yang <span className="text-gradient-neon">paling cocok</span>
          </h2>
          <p className="mt-4 text-base text-ink-500">
            Hemat lebih banyak dengan langganan—harga real-time dari sistem kami.
          </p>
        </div>

        <div className="mt-12">
          {isLoading && <Skeleton />}
          {isError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Gagal memuat paket membership. Pastikan server backend aktif di port 3000.
            </p>
          )}
          {data && data.length === 0 && (
            <p className="text-sm text-ink-400">Belum ada paket tersedia.</p>
          )}
          {data && data.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.map((p) => (
                <PlanCard key={p.id} plan={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
