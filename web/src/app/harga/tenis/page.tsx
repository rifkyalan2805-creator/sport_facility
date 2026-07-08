"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTennisPrices } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

type BookingType = "insidentil" | "abonemen";

const ROWS: { bt: BookingType; label: string; desc: string }[] = [
  { bt: "insidentil", label: "Insidentil", desc: "Tarif reguler — bebas dipesan siapa pun." },
  { bt: "abonemen", label: "Abonemen", desc: "Tarif anggota terdaftar (perlu persetujuan admin)." },
];

export default function HargaTenisPage() {
  const { data: prices = [], isLoading, isError } = useTennisPrices();

  const priceOf = (bt: BookingType, withLight: boolean) =>
    prices.find((p) => p.booking_type === bt && p.with_light === withLight)?.price;

  const savingOf = (bt: BookingType) => {
    const on = priceOf(bt, true);
    const off = priceOf(bt, false);
    return on && off ? Number(on) - Number(off) : null;
  };

  const cheapestInsidentil = prices
    .filter((p) => p.booking_type === "insidentil")
    .map((p) => Number(p.price));

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-purple" />
            Tenis
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Harga <span className="text-gradient-neon">Tenis</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-500">
            Tarif per jam, tergantung jenis booking dan pencahayaan lapangan.
            Lapangan buka 06:00–22:00.
          </p>
        </div>

        {/* Matriks tarif */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Tarif per Jam</h2>

          {isLoading && <p className="mt-6 text-ink-400">Memuat tarif…</p>}
          {isError && (
            <p className="mt-6 text-red-500">
              Gagal memuat tarif. Pastikan backend aktif (port 3000).
            </p>
          )}

          {!isLoading && !isError && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {ROWS.map(({ bt, label, desc }) => {
                const saving = savingOf(bt);
                return (
                  <div key={bt} className="flex flex-col rounded-2xl border border-ink-900/10 p-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-ink-900">{label}</h3>
                      {bt === "abonemen" && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          butuh registrasi
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink-500">{desc}</p>

                    <dl className="mt-5 space-y-3">
                      <div className="flex items-baseline justify-between border-b border-ink-900/5 pb-3">
                        <dt className="text-sm text-ink-500">Dengan lampu</dt>
                        <dd className="text-xl font-bold text-ink-900">
                          {formatRupiah(priceOf(bt, true) ?? 0)}
                          <span className="text-sm font-normal text-ink-400">/jam</span>
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <dt className="text-sm text-ink-500">Tanpa lampu</dt>
                        <dd className="text-xl font-bold text-ink-900">
                          {formatRupiah(priceOf(bt, false) ?? 0)}
                          <span className="text-sm font-normal text-ink-400">/jam</span>
                        </dd>
                      </div>
                    </dl>

                    {saving !== null && saving > 0 && (
                      <p className="mt-4 text-sm text-neon-purple">
                        Hemat {formatRupiah(saving)}/jam tanpa lampu
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && !isError && cheapestInsidentil.length > 0 && (
            <p className="mt-4 text-sm text-ink-400">
              Tarif termurah yang bisa dipesan langsung:{" "}
              <b className="text-ink-700">{formatRupiah(Math.min(...cheapestInsidentil))}/jam</b>{" "}
              (insidentil, tanpa lampu).
            </p>
          )}
        </section>

        {/* Abonemen */}
        <section className="mt-14 rounded-3xl border border-ink-900/10 bg-ink-900/[0.02] p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
            Ingin tarif <span className="text-gradient-neon">abonemen</span>?
          </h2>
          <p className="mt-3 max-w-xl text-ink-500">
            Tarif abonemen berlaku untuk anggota terdaftar. Ajukan registrasi,
            tunggu persetujuan admin, lalu tarifnya otomatis aktif saat kamu
            memesan lapangan.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/harga/tenis/abonemen/registration"
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-neon-pink"
            >
              Registrasi Abonemen
            </Link>
            <Link
              href="/booking/tennis"
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-ink-900/5"
            >
              Booking Lapangan →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
