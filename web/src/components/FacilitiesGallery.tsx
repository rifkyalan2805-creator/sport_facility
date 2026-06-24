"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Data mock — id, title, image (path asli berisi spasi → di-encode saat render).
const facilities = [
  {
    id: 1,
    sport: "Padel",
    title: "Glass Padel Arena",
    desc: "Lapangan kaca berstandar internasional dengan pencahayaan LED.",
    image: "/images/sport club/padel/paddle 1.jpg",
  },
  {
    id: 2,
    sport: "Tenis",
    title: "Center Court",
    desc: "Hard court profesional untuk latihan maupun turnamen.",
    image: "/images/sport club/Tennis/tennis 1.jpg",
  },
  {
    id: 3,
    sport: "Renang",
    title: "Olympic Pool",
    desc: "Kolam 8 lintasan dengan air terfilter dan suhu terjaga.",
    image: "/images/sport club/swimming pools/swimming 1.jpg",
  },
  {
    id: 4,
    sport: "Padel",
    title: "Panoramic Court",
    desc: "Bermain padel dengan panorama terbuka yang menyegarkan.",
    image: "/images/sport club/padel/paddle 2.jpg",
  },
  {
    id: 5,
    sport: "Tenis",
    title: "Clay Court",
    desc: "Lapangan tanah liat untuk pengalaman bermain klasik.",
    image: "/images/sport club/Tennis/tennis 2.jpg",
  },
  {
    id: 6,
    sport: "Renang",
    title: "Leisure Pool",
    desc: "Area santai untuk keluarga dan kelas renang pemula.",
    image: "/images/sport club/swimming pools/swimming 2.jpg",
  },
  {
    id: 7,
    sport: "Padel",
    title: "Pro Padel",
    desc: "Court premium dengan permukaan kompetisi resmi.",
    image: "/images/sport club/padel/paddle 3.jpg",
  },
  {
    id: 8,
    sport: "Renang",
    title: "Kids Pool",
    desc: "Kolam dangkal yang aman dan menyenangkan untuk anak.",
    image: "/images/sport club/swimming pools/swimming 3.jpg",
  },
];

export default function FacilitiesGallery() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // gsap.context men-scope semua selector ke `root` & memudahkan cleanup.
    const ctx = gsap.context(() => {
      // Hover-expand hanya relevan di layar besar (mouse). Di mobile dilewati.
      if (!window.matchMedia("(min-width: 768px)").matches) return;

      const cards = gsap.utils.toArray<HTMLElement>(".gallery-card");
      const cleanups: Array<() => void> = [];

      cards.forEach((card) => {
        const content = card.querySelector(".card-content");
        const label = card.querySelector(".card-label");
        const image = card.querySelector(".card-image");

        // State awal: konten tersembunyi & sedikit turun.
        gsap.set(content, { autoAlpha: 0, y: 24 });

        const enter = () => {
          gsap.to(card, { flexGrow: 4, duration: 0.6, ease: "power2.out" });
          gsap.to(content, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
          gsap.to(label, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
          gsap.to(image, { scale: 1.08, duration: 0.6, ease: "power2.out" });
        };
        const leave = () => {
          gsap.to(card, { flexGrow: 1, duration: 0.6, ease: "power2.out" });
          gsap.to(content, { autoAlpha: 0, y: 24, duration: 0.4, ease: "power2.out" });
          gsap.to(label, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
          gsap.to(image, { scale: 1, duration: 0.6, ease: "power2.out" });
        };

        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      });

      // Dikembalikan ke context → dijalankan saat ctx.revert() (hapus listener).
      return () => cleanups.forEach((fn) => fn());
    }, root);

    return () => ctx.revert(); // cleanup → cegah memory leak
  }, []);

  return (
    <section id="fasilitas" className="relative bg-white px-6 py-24 md:py-32">
      <div ref={root} className="mx-auto max-w-7xl">
        {/* Copywriting */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
            Sport Club
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Satu Klub. <span className="text-gradient-neon">Semua Arena.</span>
          </h2>
          <p className="mt-4 text-balance text-base leading-relaxed text-ink-500 sm:text-lg">
            Dari lapangan padel dan tenis hingga kolam renang berkelas—arahkan
            kursor ke setiap kartu untuk menjelajah fasilitas favoritmu.
          </p>
        </div>

        {/* Galeri accordion */}
        <div className="mt-12 flex flex-col gap-3 md:h-[560px] md:flex-row">
          {facilities.map((item) => (
            <article
              key={item.id}
              className="gallery-card group relative h-72 min-w-0 flex-1 cursor-pointer overflow-hidden rounded-[20px] md:h-full"
            >
              {/* Gambar */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(item.image)}
                alt={`Fasilitas ${item.sport} — ${item.title}`}
                loading="lazy"
                className="card-image absolute inset-0 h-full w-full object-cover"
              />
              {/* Gradient agar teks terbaca */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              {/* Label vertikal (tampak saat kartu menyempit) */}
              <span className="card-label pointer-events-none absolute bottom-6 left-6 text-sm font-semibold uppercase tracking-[0.2em] text-white [writing-mode:vertical-rl] rotate-180">
                {item.sport}
              </span>

              {/* Konten yang muncul saat hover. Wrapper pointer-events-none,
                  tombol pointer-events-auto agar tetap bisa diklik. */}
              <div className="card-content pointer-events-none absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                  {item.sport}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 max-w-xs text-sm leading-relaxed text-white/80">
                  {item.desc}
                </p>
                <a
                  href="#"
                  className="pointer-events-auto mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-medium text-ink-900 transition-colors duration-200 hover:bg-white/90"
                >
                  Lihat Detail
                  <span aria-hidden>&rarr;</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
