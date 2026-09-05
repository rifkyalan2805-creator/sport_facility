"use client";

import { useRef } from "react";
import Button, { Eyebrow } from "@/components/brand/Button";
import { REVEAL_MEDIA, REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";

/**
 * Seksi Padel — teks di kiri, satu potret besar di kanan.
 *
 * Sebelumnya seksi ini mengunci layar (pin +150%) dengan empat foto yang
 * terbang miring dari sudut, mengorbit teks, lalu berhamburan keluar.
 * Semua dihapus: halaman dibaca atas ke bawah, foto disingkap tepi bergerak.
 *
 * FOTO: `paddle 1`, `2`, dan `4` TIDAK dipakai karena memuat watermark
 * Dreamstime / Shutterstock / Alamy yang terlihat jelas. Begitu foto lapangan
 * asli tersedia, tambahkan ke `SUPPORTING` di bawah dan baris pendukungnya
 * akan tampil otomatis.
 */

const LEAD = {
  src: "/images/sport club/padel/paddle 3.jpg",
  alt: "Pemain padel bersiap melakukan pukulan",
};

/** Foto pendukung — kosong sampai tersedia berkas tanpa watermark. */
const SUPPORTING: { src: string; alt: string }[] = [];

export default function PadelShowcase() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section ref={root} className="bg-paper-white px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 md:grid-cols-[1fr_38%] md:items-center md:gap-14">
          {/* Kolom teks */}
          <div className="max-w-xl">
            <div className={REVEAL_TEXT}>
              <Eyebrow>Padel</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
            >
              Cepat dipelajari,
              <br />
              lama dikuasai.
            </h2>
            <div className={`${REVEAL_TEXT} mt-8 h-px w-full bg-obsidian/10`} />
            <p
              className={`${REVEAL_TEXT} mt-6 font-display text-base leading-relaxed text-graphite`}
            >
              Empat pemain, satu lapangan kaca, dan reli yang jarang cepat
              berakhir. Padel mudah dimulai bahkan tanpa pengalaman raket
              sebelumnya — dan tetap menantang setelah puluhan jam bermain.
              Lapangan kami berpencahayaan merata, jadi jam malam sama layak
              dimainkan seperti pagi hari.
            </p>
            <div className={REVEAL_TEXT}>
              <Button href="/harga/padel" variant="obsidian" size="lg" className="mt-8">
                Atur Jadwal
              </Button>
            </div>
          </div>

          {/* Potret utama */}
          <figure
            className={`${REVEAL_MEDIA} overflow-hidden rounded-xl border border-obsidian/10`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodeURI(LEAD.src)}
              alt={LEAD.alt}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </figure>
        </div>

        {SUPPORTING.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SUPPORTING.map((p) => (
              <figure
                key={p.src}
                className={`${REVEAL_MEDIA} overflow-hidden rounded-xl border border-obsidian/10`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeURI(p.src)}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
