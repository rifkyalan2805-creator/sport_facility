"use client";

import { useRef } from "react";
import Button, { Eyebrow } from "@/components/brand/Button";
import { REVEAL_MEDIA, REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";

/**
 * Seksi Kolam Renang — Card Grid 3 kolom sesuai DESIGN.md
 * (jarak kolom 12px, jarak baris 40px, di atas kanvas abu).
 *
 * Sebelumnya seksi ini mengunci layar lalu menggeser enam foto horizontal,
 * dengan teks yang di-counter-translate, foto yang memudar saat melewatinya,
 * dan gerak mengambang tak berujung (repeat: -1). Semuanya dihapus —
 * halaman kembali dibaca lurus atas ke bawah.
 *
 * FOTO: hanya memakai berkas TANPA watermark. `swimming 2/3/4` sengaja tidak
 * dipakai karena memuat watermark Bigstock / SHIRK Photography yang terlihat.
 * Tambahkan foto fasilitas asli ke daftar ini bila sudah tersedia.
 */
const POOL_PHOTOS = [
  { src: "/images/sport club/swimming pools/swimming 1.jpg", alt: "Perenang bersiap di tepi kolam" },
  { src: "/images/sport club/swimming pools/swimming 5.jpg", alt: "Peserta kelas renang anak" },
  { src: "/images/sport club/swimming pools/swimming 6.jpg", alt: "Perenang melakukan gaya kupu-kupu" },
];

export default function SwimmingShowcase() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section ref={root} className="bg-cloud-gray px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <div className={REVEAL_TEXT}>
            <Eyebrow>Kolam Renang</Eyebrow>
          </div>
          <h2
            className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
          >
            Air yang diperiksa,
            <br />
            bukan sekadar diisi.
          </h2>
          <div className={`${REVEAL_TEXT} mt-8 h-px w-full bg-obsidian/10`} />
          <p
            className={`${REVEAL_TEXT} mt-6 font-display text-base leading-relaxed text-graphite`}
          >
            Kualitas air diuji berkala dan sistem filtrasi berjalan setiap hari,
            karena itulah bagian yang paling sering diabaikan kolam umum.
            Tersedia lintasan untuk latihan terukur, area rekreasi keluarga,
            serta kelas renang terbimbing untuk pemula segala usia.
          </p>
          <div className={REVEAL_TEXT}>
            <Button href="/membership/daftar" variant="obsidian" size="lg" className="mt-8">
              Atur Jadwal
            </Button>
          </div>
        </div>

        {/* Card Grid: jarak kolom 12px, jarak baris 40px (DESIGN.md) */}
        <div className="mt-14 grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {POOL_PHOTOS.map((p) => (
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
      </div>
    </section>
  );
}
