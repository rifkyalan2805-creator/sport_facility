"use client";

import { useRef } from "react";
import Button, { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";

/**
 * Section 3 — pernyataan standar klub, sekaligus jalan pulang ke beranda.
 *
 * Sengaja tanpa foto (permintaan pemilik): kesan olahraga dibangun dari kontras
 * latar hitam, tipografi display berbobot black, dan angka besar — bukan dari
 * gambar. Tombol utama memakai varian `paper`, bukan `gradient`, karena footer
 * tepat di bawahnya sudah memegang satu-satunya tombol gradient di layar ini.
 */

/** Tiga angka yang bisa diverifikasi pengunjung sendiri saat datang. */
const PILAR = [
  {
    figure: "3",
    title: "Cabang olahraga",
    desc: "Padel, tenis, dan kolam renang berdiri di satu kawasan dengan satu pintu masuk dan satu area parkir.",
  },
  {
    figure: "17",
    title: "Jam operasional harian",
    desc: "Buka 06.00 hingga 23.00 WIB setiap hari — cukup untuk sesi pagi sebelum kerja maupun main malam.",
  },
  {
    figure: "1",
    title: "Tim yang merawat",
    desc: "Permukaan lapangan, kejernihan air, dan kebersihan ruang bilas dipegang tim yang sama, dengan checklist yang sama.",
  },
];

export default function SportStatement() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section
      ref={root}
      id="standar"
      className="bg-obsidian px-6 py-24 text-paper-white md:py-32"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div>
            <div className={REVEAL_TEXT}>
              <Eyebrow tone="gradient">Standar Kami</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display sm:text-5xl md:text-6xl`}
            >
              Tempat main
              <br />
              yang dirawat
              <br />
              seperti tempat
              <br />
              bertanding.
            </h2>
          </div>

          <div className="lg:pt-3">
            <p
              className={`${REVEAL_TEXT} font-display text-lg leading-relaxed text-paper-white/80 sm:text-xl`}
            >
              Klub ini dikelola sebagai operasi harian, bukan lahan yang
              kebetulan disewakan. Ada jadwal perawatan yang berjalan di luar
              jam ramai, ada standar yang dipegang untuk tiap permukaan, dan ada
              catatan pemakaian yang membuat kami tahu lapangan mana yang perlu
              diistirahatkan lebih dulu.
            </p>
            <p
              className={`${REVEAL_TEXT} mt-6 font-display text-base leading-relaxed text-paper-white/55`}
            >
              Untuk pemain, hasilnya adalah hal-hal kecil yang jarang
              disebutkan tapi langsung terasa: pantulan bola yang konsisten,
              lampu yang menyala penuh saat sesi malam, air kolam yang tidak
              perlu ditebak kondisinya, dan slot yang benar-benar kosong ketika
              sistem bilang kosong.
            </p>
          </div>
        </div>

        {/* ---- Tiga angka ---- */}
        <div className="mt-20 grid grid-cols-1 gap-px border-t border-paper-white/15 md:grid-cols-3">
          {PILAR.map((p) => (
            <div
              key={p.title}
              className={`${REVEAL_TEXT} border-b border-paper-white/15 py-10 md:border-b-0 md:px-10 md:first:pl-0 md:last:pr-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-paper-white/15`}
            >
              <span className="block font-display text-6xl font-black leading-none tracking-hero text-paper-white">
                {p.figure}
              </span>
              <h3 className="mt-5 font-condensed text-xs font-semibold uppercase tracking-eyebrow text-paper-white/70">
                {p.title}
              </h3>
              <p className="mt-3 max-w-xs font-display text-[15px] leading-relaxed text-paper-white/55">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ---- Jalan kembali ke beranda ---- */}
        <div
          className={`${REVEAL_TEXT} mt-16 flex flex-col items-start gap-6 border-t border-paper-white/15 pt-12 md:flex-row md:items-center md:justify-between`}
        >
          <p className="max-w-lg font-display text-xl font-semibold leading-snug tracking-tight text-paper-white sm:text-2xl">
            Lihat lapangan, harga, dan jadwal yang sedang terbuka di halaman
            utama.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/" variant="paper" size="lg">
              Kembali ke Beranda
            </Button>
            <Button
              href="/harga"
              variant="ghost"
              size="lg"
              className="border-paper-white/25 text-paper-white hover:border-paper-white/60 hover:bg-paper-white/5"
            >
              Daftar Harga
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
