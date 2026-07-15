"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageNav from "@/components/PageNav";
import { usePoolTicketTypes, useMembershipPlans } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

export default function HargaPoolPage() {
  const htm = usePoolTicketTypes();
  const plans = useMembershipPlans();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <PageNav variant="cta" className="mb-6" />
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
            Kolam Renang
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Harga <span className="text-gradient-neon">Kolam Renang</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-500">
            Tiket masuk (HTM) dan paket membership untuk akses kolam. Kolam tutup
            pukul 20:30.
          </p>
        </div>

        {/* HTM */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
            Tiket Masuk (HTM)
          </h2>
          {htm.isLoading && <p className="mt-6 text-ink-400">Memuat…</p>}
          {htm.isError && (
            <p className="mt-6 text-red-500">
              Gagal memuat. Pastikan backend aktif (port 3000).
            </p>
          )}
          {htm.data && htm.data.length === 0 && (
            <p className="mt-6 text-ink-400">Belum ada tiket kolam.</p>
          )}
          {htm.data && htm.data.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {htm.data.map((t) => (
                <div key={t.id} className="flex flex-col rounded-2xl border border-ink-900/10 p-5">
                  <h3 className="text-lg font-semibold text-ink-900">{t.name}</h3>
                  <p className="mt-1 text-sm text-ink-400">
                    Usia {t.age_min}–{t.age_max} th
                  </p>
                  <p className="mt-3">
                    <span className="text-2xl font-bold text-ink-900">
                      {formatRupiah(t.price)}
                    </span>
                    <span className="text-sm text-ink-400"> / orang</span>
                  </p>
                  <Link
                    href="/register"
                    className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-700"
                  >
                    Beli Tiket
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Membership */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
            Paket Membership
          </h2>
          {plans.isLoading && <p className="mt-6 text-ink-400">Memuat paket…</p>}
          {plans.isError && (
            <p className="mt-6 text-red-500">Gagal memuat paket membership.</p>
          )}
          {plans.data && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.data.map((plan) => (
                <div key={plan.id} className="flex flex-col rounded-2xl border border-ink-900/10 p-5">
                  <h3 className="text-lg font-semibold text-ink-900">{plan.name}</h3>
                  <p className="mt-2">
                    <span className="text-2xl font-bold text-ink-900">
                      {formatRupiah(plan.price)}
                    </span>
                    <span className="text-sm text-ink-400"> / {plan.duration_days} hari</span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.benefits.slice(0, 4).map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-500">
                        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-shrink-0 fill-neon-purple" aria-hidden>
                          <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.5-1.5z" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-full bg-ink-900 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-700"
                  >
                    Pilih Paket
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
