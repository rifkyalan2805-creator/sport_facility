"use client";

import { useRef } from "react";
import Button, { Eyebrow } from "@/components/brand/Button";
import { REVEAL_MEDIA, REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";

/**
 * Seksi Tenis — susunan dicerminkan dari seksi Padel (foto kiri, teks kanan)
 * supaya ritme halaman berselang-seling, bukan dua blok kembar.
 *
 * Sebelumnya seksi ini mengunci layar (pin +200%): enam kartu menumpuk di
 * tengah lalu menyebar membentuk busur sambil berotasi, disusul label yang
 * memantul masuk dengan easing back.out(2). Semuanya dihapus.
 *
 * FOTO: dari enam berkas tenis, hanya `tennis 5` yang layak terbit di sini —
 * `tennis 1` berwatermark, `tennis 2` siluet oranye (bertabrakan dgn palet),
 * `tennis 3` sudah dipakai hero, `tennis 4` menampilkan atlet profesional yang
 * dikenali (Wimbledon), dan `tennis 6` memuat spanduk organisasi lain.
 */

const LEAD = {
  src: "/images/sport club/Tennis/tennis 5.jpg",
  alt: "Pemain beristirahat di sisi net lapangan tenis",
};

/** Jenis permukaan yang ditawarkan — ditampilkan sbg daftar, bukan label foto. */
const SURFACES = [
  { name: "Hard Court", note: "Pantulan cepat, perawatan paling ringan" },
  { name: "Clay Court", note: "Reli lebih panjang, beban sendi lebih ringan" },
  { name: "Lapangan Berlampu", note: "Tersedia untuk sesi malam" },
];

export default function SpreadHero() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section ref={root} className="bg-paper-white px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 md:grid-cols-[38%_1fr] md:items-center md:gap-14">
          {/* Potret utama — di kiri, kebalikan dari seksi Padel */}
          <figure
            className={`${REVEAL_MEDIA} overflow-hidden rounded-xl border border-obsidian/10 md:order-1`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodeURI(LEAD.src)}
              alt={LEAD.alt}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </figure>

          {/* Kolom teks */}
          <div className="max-w-xl md:order-2">
            <div className={REVEAL_TEXT}>
              <Eyebrow>Tenis</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
            >
              Tiga jenis permukaan,
              <br />
              satu klub.
            </h2>
            <div className={`${REVEAL_TEXT} mt-8 h-px w-full bg-obsidian/10`} />
            <p
              className={`${REVEAL_TEXT} mt-6 font-display text-base leading-relaxed text-graphite`}
            >
              Setiap permukaan mengubah cara bola memantul, dan karenanya
              mengubah cara Anda bermain. Tersedia sewa per jam maupun abonemen
              bagi yang berlatih rutin — dengan jam tetap setiap minggu sehingga
              tidak perlu berebut slot.
            </p>

            <dl className={`${REVEAL_TEXT} mt-8 divide-y divide-obsidian/10 border-y border-obsidian/10`}>
              {SURFACES.map((s) => (
                <div key={s.name} className="flex flex-wrap gap-x-6 gap-y-1 py-4">
                  <dt className="font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian sm:w-48">
                    {s.name}
                  </dt>
                  <dd className="font-display text-sm text-graphite">{s.note}</dd>
                </div>
              ))}
            </dl>

            <div className={REVEAL_TEXT}>
              <Button href="/harga/tenis" variant="obsidian" size="lg" className="mt-8">
                Atur Jadwal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
