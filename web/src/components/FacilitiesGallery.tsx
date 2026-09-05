"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Eyebrow } from "@/components/brand/Button";

// Kartu fasilitas — path asli berisi spasi → di-encode saat render.
const facilities = [
  {
    id: 1,
    sport: "Padel",
    title: "Glass Court",
    desc: "Dinding kaca temper dengan pencahayaan LED merata, siap dipakai malam hari.",
    image: "/images/sport club/padel/paddle 1.jpg",
    href: "/harga/padel",
  },
  {
    id: 2,
    sport: "Tenis",
    title: "Center Court",
    desc: "Hard court berstandar kompetisi untuk latihan rutin maupun turnamen.",
    image: "/images/sport club/Tennis/tennis 1.jpg",
    href: "/harga/tenis",
  },
  {
    id: 3,
    sport: "Renang",
    title: "Kolam Utama",
    desc: "Delapan lintasan dengan filtrasi berkala dan suhu air yang dijaga stabil.",
    image: "/images/sport club/swimming pools/swimming 1.jpg",
    href: "/harga/pool",
  },
  {
    id: 4,
    sport: "Padel",
    title: "Panoramic Court",
    desc: "Lapangan terbuka dengan sirkulasi udara baik dan panorama dataran tinggi.",
    image: "/images/sport club/padel/paddle 2.jpg",
    href: "/harga/padel",
  },
  {
    id: 5,
    sport: "Tenis",
    title: "Clay Court",
    desc: "Permukaan tanah liat untuk permainan reli panjang dan beban sendi lebih ringan.",
    image: "/images/sport club/Tennis/tennis 2.jpg",
    href: "/harga/tenis",
  },
  {
    id: 6,
    sport: "Renang",
    title: "Kolam Rekreasi",
    desc: "Area santai untuk keluarga sekaligus kelas renang tingkat pemula.",
    image: "/images/sport club/swimming pools/swimming 2.jpg",
    href: "/harga/pool",
  },
  {
    id: 7,
    sport: "Padel",
    title: "Pro Court",
    desc: "Permukaan kompetisi resmi, dipakai untuk laga eksibisi dan seleksi.",
    image: "/images/sport club/padel/paddle 3.jpg",
    href: "/harga/padel",
  },
  {
    id: 8,
    sport: "Renang",
    title: "Kolam Anak",
    desc: "Kedalaman terkontrol dengan pengawasan penjaga kolam sepanjang jam buka.",
    image: "/images/sport club/swimming pools/swimming 3.jpg",
    href: "/harga/pool",
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
    <section id="fasilitas" className="bg-cloud-gray px-6 py-24 md:py-28">
      <div ref={root} className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <Eyebrow>Fasilitas</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl">
            Tiga cabang olahraga,
            <br />
            satu lokasi.
          </h2>
          {/* Garis rambut selebar konten — ciri tata letak broadsheet */}
          <div className="mt-8 h-px w-full bg-obsidian/10" />
          <p className="mt-6 max-w-xl font-display text-base leading-relaxed text-graphite">
            Setiap lapangan dan kolam dirawat menurut jadwal tetap, bukan sekadar
            saat ada keluhan. Arahkan kursor pada kartu untuk melihat rinciannya.
          </p>
        </div>

        {/* Galeri accordion */}
        <div className="mt-14 flex flex-col gap-3 md:h-[560px] md:flex-row">
          {facilities.map((item) => (
            <article
              key={item.id}
              className="gallery-card group relative h-72 min-w-0 flex-1 cursor-pointer overflow-hidden rounded-xl border border-obsidian/10 md:h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(item.image)}
                alt={`${item.sport} — ${item.title}`}
                loading="lazy"
                className="card-image absolute inset-0 h-full w-full object-cover"
              />
              {/* Gelapkan agar teks putih terbaca */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Label vertikal (tampak saat kartu menyempit) */}
              <span className="card-label pointer-events-none absolute bottom-6 left-6 rotate-180 font-condensed text-sm font-semibold uppercase tracking-eyebrow text-paper-white [writing-mode:vertical-rl]">
                {item.sport}
              </span>

              {/* Konten saat hover. Wrapper pointer-events-none,
                  tautan pointer-events-auto agar tetap bisa diklik. */}
              <div className="card-content pointer-events-none absolute inset-x-0 bottom-0 p-6">
                <span className="font-condensed text-xs font-semibold uppercase tracking-eyebrow text-paper-white/70">
                  {item.sport}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-display text-paper-white">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xs font-display text-sm leading-relaxed text-paper-white/75">
                  {item.desc}
                </p>
                <Link
                  href={item.href}
                  className="pointer-events-auto mt-5 inline-flex items-center gap-2 rounded-lg bg-paper-white px-5 py-2.5 font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian outline-none transition-colors duration-200 hover:bg-paper-white/90 focus-visible:ring-4 focus-visible:ring-paper-white/30"
                >
                  Lihat Harga
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
