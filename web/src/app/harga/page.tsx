"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageNav from "@/components/PageNav";
import { usePricing, useMembershipPlans } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-900/5 py-2.5 text-sm last:border-0">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  );
}

function Card({
  title,
  closeTime,
  children,
}: {
  title: string;
  closeTime: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink-900/10 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
        <span className="rounded-full bg-ink-900/5 px-3 py-1 text-xs font-medium text-ink-500">
          Tutup {closeTime}
        </span>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function HargaPage() {
  const { data: pricing, isLoading, isError } = usePricing();
  const plans = useMembershipPlans();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <PageNav variant="cta" className="mb-6" />
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
            Daftar Harga
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Harga Sewa &amp; <span className="text-gradient-neon">Tiket</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-500">
            Harga sewa lapangan, tiket kolam, dan paket membership. Jam tutup
            berbeda tiap fasilitas.
          </p>
        </div>

        {/* States */}
        {isLoading && <p className="mt-10 text-ink-400">Memuat daftar harga…</p>}
        {isError && (
          <p className="mt-10 text-red-500">
            Gagal memuat harga. Pastikan server backend aktif (port 3000).
          </p>
        )}

        {/* Kartu harga dari site_settings.pricing */}
        {pricing && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card title="Tenis" closeTime={pricing.tennis.close_time}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
                Insidentil / jam
              </p>
              <Row label="Dengan lampu" value={formatRupiah(pricing.tennis.insidentil.with_light)} />
              <Row label="Tanpa lampu" value={formatRupiah(pricing.tennis.insidentil.without_light)} />
              <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider text-ink-400">
                Abonemen / jam
              </p>
              <Row label="Dengan lampu" value={formatRupiah(pricing.tennis.abonemen.with_light)} />
              <Row label="Tanpa lampu" value={formatRupiah(pricing.tennis.abonemen.without_light)} />
            </Card>

            <Card title="Padel" closeTime={pricing.padel.close_time}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
                Sewa / jam
              </p>
              <Row label="Normal" value={formatRupiah(pricing.padel.insidentil)} />
              <Row
                label={`Off-peak (${pricing.padel.off_peak.window})`}
                value={formatRupiah(pricing.padel.off_peak.price)}
              />
            </Card>

            <Card title="Kolam Renang" closeTime={pricing.pool.close_time}>
              <Row label="HTM per orang" value={formatRupiah(pricing.pool.htm_per_person)} />
            </Card>
          </div>
        )}

        {/* Paket Membership (dinamis) */}
        <div className="mt-16">
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
                <div
                  key={plan.id}
                  className="flex flex-col rounded-2xl border border-ink-900/10 p-5"
                >
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
        </div>
      </main>
      <Footer />
    </>
  );
}
