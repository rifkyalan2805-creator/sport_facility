"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Aset foto — array of object lokal agar mudah diganti.
 * Ganti `src` di bawah dengan foto padel Anda (mis. /images/padel1.jpg ...).
 * Catatan: file "paddle 4" belum ada di folder, jadi slot ke-6 memakai
 * placeholder sementara — silakan timpa.
 */
const leftPhotos = [
  { id: "l1", src: "/images/sport club/padel/paddle 1.jpg", alt: "Aksi padel 1" },
  { id: "l2", src: "/images/sport club/padel/paddle 2.jpg", alt: "Aksi padel 2" },
  { id: "l3", src: "/images/sport club/padel/paddle 3.jpg", alt: "Aksi padel 3" },
];

const rightPhotos = [
  { id: "r1", src: "/images/sport club/padel/paddle 5.jpg", alt: "Aksi padel 5" },
  { id: "r2", src: "/images/sport club/padel/paddle 6.jpg", alt: "Aksi padel 6" },
  { id: "r3", src: "/images/sport club/padel/paddle 1.jpg", alt: "Aksi padel (placeholder)" },
];

function PhotoCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-ink-900/5 shadow-lg shadow-ink-900/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={encodeURI(src)}
        alt={alt}
        loading="lazy"
        className="h-64 w-full object-cover md:h-[42vh]"
      />
    </div>
  );
}

export default function PadelShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const leftCol = useRef<HTMLDivElement>(null);
  const rightCol = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin + parallax hanya di desktop (mouse-scroll). Mobile: layout statis.
      if (!window.matchMedia("(min-width: 768px)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=130%", // jarak scroll selama section terkunci (pinned)
          pin: true, // kunci section di layar selama animasi
          scrub: 1, // sinkron dengan roda mouse (smoothing 1 detik)
          invalidateOnRefresh: true,
        },
      });

      // Parallax asimetris: kiri bergerak ke ATAS (yPercent negatif),
      // kanan bergerak ke BAWAH (yPercent positif), magnitudo berbeda.
      tl.fromTo(leftCol.current, { yPercent: 6 }, { yPercent: -20, ease: "none" }, 0);
      tl.fromTo(rightCol.current, { yPercent: -14 }, { yPercent: 14, ease: "none" }, 0);
    }, root);

    return () => ctx.revert(); // cleanup → cegah memory leak
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-white md:h-screen"
    >
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-20 md:grid-cols-3 md:py-0">
        {/* Kolom kiri — bergerak ke atas */}
        <div ref={leftCol} className="flex flex-col gap-6 will-change-transform">
          {leftPhotos.map((p) => (
            <PhotoCard key={p.id} src={p.src} alt={p.alt} />
          ))}
        </div>

        {/* Kolom tengah — teks persuasif (statis di tengah saat pinned) */}
        <div className="order-first flex flex-col items-center text-center md:order-none">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
            Padel Ecosystem
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            Masuk ke Dalam{" "}
            <span className="text-gradient-neon">Ekosistem Padel</span> Kami
          </h2>
          <p className="mt-5 max-w-md text-balance text-base leading-relaxed text-ink-500">
            Padel bukan sekadar olahraga, ini adalah tempat di mana kompetisi
            bertemu dengan koneksi. Mulai dari pemula hingga pemain pro, kami
            membangun ruang komunitas yang aktif, fasilitas lapangan premium, dan
            turnamen yang seru. Ambil raketmu, temukan rekan tanding baru, dan
            mari tumbuh bersama di ekosistem Padel paling dinamis saat ini.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-neon-purple/25 transition-transform duration-200 hover:scale-[1.03]"
          >
            Pesan Lapangan &amp; Gabung Komunitas
          </a>
        </div>

        {/* Kolom kanan — bergerak ke bawah */}
        <div ref={rightCol} className="flex flex-col gap-6 will-change-transform">
          {rightPhotos.map((p) => (
            <PhotoCard key={p.id} src={p.src} alt={p.alt} />
          ))}
        </div>
      </div>
    </section>
  );
}
