"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 6 kartu tenis — urut kiri → kanan (tennis 1 .. tennis 6).
// Catatan: file ke-4 bernama "tennis4.jpg" (tanpa spasi).
const cards = [
  { id: 1, src: "/images/sport club/Tennis/tennis 1.jpg", tag: "Indoor Court" },
  { id: 2, src: "/images/sport club/Tennis/tennis 2.jpg", tag: "Hard Court" },
  { id: 3, src: "/images/sport club/Tennis/tennis 3.jpg", tag: "Clay Court" },
  { id: 4, src: "/images/sport club/Tennis/tennis 4.jpg", tag: "Outdoor" },
  { id: 5, src: "/images/sport club/Tennis/tennis 5.jpg", tag: "Floodlit" },
  { id: 6, src: "/images/sport club/Tennis/tennis 6.jpg", tag: "Center Court" },
];

// Posisi akhir (fraksi lebar stage), rotasi (deg), dan arc vertikal (px).
const SPREAD_X = [-0.4, -0.24, -0.08, 0.08, 0.24, 0.4];
const SPREAD_ROT = [-14, -8, -3, 3, 8, 14];
const SPREAD_Y = [-14, -2, 10, 10, -2, -14];

export default function SpreadHero() {
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!window.matchMedia("(min-width: 768px)").matches) return;

      const stageW = () => stage.current?.clientWidth ?? 600;

      // State awal: kartu menumpuk di tengah stage, tag tersembunyi.
      gsap.set(".spread-card", { xPercent: -50, yPercent: -50, scale: 0.82 });
      gsap.set(".spread-tag", { autoAlpha: 0, scale: 0.5, y: 8 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=200%", // ruang scroll panjang untuk 3 fase
          pin: true, // section dikunci sampai animasi selesai
          scrub: 1, // animasi terikat posisi scroll
          invalidateOnRefresh: true, // hitung ulang posisi saat resize
        },
      });

      // Teks TIDAK dianimasikan → tetap terkunci & terlihat selama section
      // di-pin, sampai seluruh animasi (kartu + tag) selesai.

      // FASE 2 (15%) — kartu menyebar ke posisi masing-masing + rotasi
      tl.to(
        ".spread-card",
        {
          x: (i: number) => stageW() * SPREAD_X[i],
          y: (i: number) => SPREAD_Y[i],
          rotation: (i: number) => SPREAD_ROT[i],
          scale: 1,
          stagger: 0.05,
          duration: 0.35,
        },
        0.15,
      );

      // FASE 3 (40%) — tag labels muncul satu per satu dengan efek pop
      tl.to(
        ".spread-tag",
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          ease: "back.out(2)",
          stagger: 0.08,
          duration: 0.5,
        },
        0.4,
      );
    }, root);

    return () => ctx.revert(); // cleanup → cegah memory leak
  }, []);

  return (
    <section
      ref={root}
      className="relative min-h-screen overflow-hidden bg-white md:h-screen"
    >
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-[40%_60%] md:gap-0">
        {/* KIRI — copywriting (parallax + fade pada Fase 1) */}
        <div ref={copy} className="z-10 md:pr-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-purple" />
            Tennis Ecosystem
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            Kuasai Lapangan dan Bergabunglah dengan{" "}
            <span className="text-gradient-neon">Ekosistem Tenis</span> Kami
          </h2>
          <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-500">
            Tenis adalah tentang presisi, stamina, dan koneksi yang dibangun di
            atas lapangan. Di sini, kami menciptakan ekosistem tenis modern yang
            mempertemukan pemain dari segala level—dari pemula yang baru
            memegang raket hingga pemain liga. Dapatkan akses lapangan
            indoor/outdoor premium, program coaching intensif, dan jadwal
            sparring mingguan. Ayunkan raketmu, perlebar jaringanmu, dan jadilah
            bagian dari komunitas kami.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-neon-purple/25 transition-transform duration-200 hover:scale-[1.03]"
          >
            Booking Lapangan &amp; Cari Teman Sparring
          </a>
        </div>

        {/* KANAN — stage kartu menyebar (desktop) */}
        <div ref={stage} className="relative hidden h-full md:block">
          {cards.map((c, i) => (
            <div
              key={c.id}
              className="spread-card absolute left-1/2 top-1/2 w-48 lg:w-56"
              style={{ zIndex: 10 - Math.abs(i - 2.5) }}
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl shadow-ink-900/25 ring-1 ring-white/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeURI(c.src)}
                  alt={`Tenis ${c.id} — ${c.tag}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
              <span className="spread-tag absolute -top-3 left-3 rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                {c.tag}
              </span>
            </div>
          ))}
        </div>

        {/* KANAN — versi mobile (grid statis, tanpa pin) */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {cards.map((c) => (
            <figure key={c.id} className="relative overflow-hidden rounded-2xl shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(c.src)}
                alt={`Tenis ${c.id} — ${c.tag}`}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover"
              />
              <figcaption className="absolute left-2 top-2 rounded-full bg-ink-900/90 px-2.5 py-1 text-[10px] font-semibold text-white">
                {c.tag}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
