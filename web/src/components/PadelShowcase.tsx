"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 4 gambar sudut mengelilingi konten tengah (mudah diganti — ubah `src`).
const corners = [
  { cls: "image-top-left", pos: "left-[4%] top-[12%]", src: "/images/sport club/padel/paddle 1.jpg" },
  { cls: "image-bottom-left", pos: "left-[6%] bottom-[10%]", src: "/images/sport club/padel/paddle 2.jpg" },
  { cls: "image-top-right", pos: "right-[4%] top-[14%]", src: "/images/sport club/padel/paddle 3.jpg" },
  { cls: "image-bottom-right", pos: "right-[6%] bottom-[10%]", src: "/images/sport club/padel/paddle 4.jpg" },
];

function Copy() {
  return (
    <>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
        <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
        Padel Ecosystem
      </span>
      <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-4xl">
        Masuk ke Dalam{" "}
        <span className="text-gradient-neon">Ekosistem Padel</span> Kami
      </h2>
      <p className="mt-4 max-w-md text-balance text-[15px] leading-normal text-ink-500">
        Padel bukan sekadar olahraga, ini adalah tempat di mana kompetisi
        bertemu dengan koneksi. Mulai dari pemula hingga pemain pro, kami
        membangun ruang komunitas yang aktif, fasilitas lapangan premium, dan
        turnamen yang seru. Ambil raketmu, temukan rekan tanding baru, dan mari
        tumbuh bersama di ekosistem Padel paling dinamis saat ini.
      </p>
      <Link
        href="/harga/padel"
        className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-neon-purple/25 transition-transform duration-200 hover:scale-[1.03]"
      >
        Pesan Lapangan &amp; Gabung Komunitas
      </Link>
    </>
  );
}

export default function PadelShowcase() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin + animasi penuh hanya di desktop. Mobile: layout statis.
      if (!window.matchMedia("(min-width: 768px)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current, // .showcase-section
          pin: true,
          start: "top top",
          end: "+=150%",
          scrub: 1,
          anticipatePin: 1,
          snap: {
            snapTo: (p: number) => (p < 0.2 ? 0 : p > 0.8 ? 1 : 0.5),
            duration: { min: 0.2, max: 0.5 },
            ease: "power1.inOut",
          },
          invalidateOnRefresh: true,
        },
      });

      // ---- ENTRANCE (0–30%): konten + 4 gambar masuk dari sudut + rotasi ----
      tl.fromTo(".showcase-content", { opacity: 0.9, y: 30 }, { opacity: 1, y: 0, ease: "power2.out" }, 0);
      tl.fromTo(".image-top-left", { x: -150, y: -100, rotation: -15, scale: 0.85, opacity: 0.6 }, { x: 0, y: 0, rotation: -8, scale: 1, opacity: 1, ease: "power2.out" }, 0);
      tl.fromTo(".image-bottom-left", { x: -120, y: 150, rotation: 20, scale: 0.85, opacity: 0.6 }, { x: 0, y: 0, rotation: 12, scale: 1, opacity: 1, ease: "power2.out" }, 0.05);
      tl.fromTo(".image-top-right", { x: 150, y: -80, rotation: 12, scale: 0.85, opacity: 0.6 }, { x: 0, y: 0, rotation: 6, scale: 1, opacity: 1, ease: "power2.out" }, 0.1);
      tl.fromTo(".image-bottom-right", { x: 130, y: 120, rotation: -12, scale: 0.85, opacity: 0.6 }, { x: 0, y: 0, rotation: -5, scale: 1, opacity: 1, ease: "power2.out" }, 0.15);

      // ---- PARALLAX (30–70%): gambar bergerak mengelilingi konten (ease none) ----
      tl.to(".image-top-left", { y: -200, x: -80, rotation: -15, ease: "none" }, 0.3);
      tl.to(".image-bottom-left", { y: 180, x: -100, rotation: 18, ease: "none" }, 0.3);
      tl.to(".image-top-right", { y: -180, x: 80, rotation: 10, ease: "none" }, 0.3);
      tl.to(".image-bottom-right", { y: 200, x: 100, rotation: -10, ease: "none" }, 0.3);

      // ---- EXIT (70–100%): konten fade, gambar menyebar jauh + fade ----
      tl.to(".showcase-content", { opacity: 0.3, y: -50, ease: "power2.in" }, 0.7);
      tl.to(".image-top-left", { x: -250, y: -300, opacity: 0.2, scale: 0.8, ease: "power2.in" }, 0.7);
      tl.to(".image-bottom-left", { x: -200, y: 300, opacity: 0.2, scale: 0.8, ease: "power2.in" }, 0.7);
      tl.to(".image-top-right", { x: 250, y: -280, opacity: 0.2, scale: 0.8, ease: "power2.in" }, 0.7);
      tl.to(".image-bottom-right", { x: 220, y: 320, opacity: 0.2, scale: 0.8, ease: "power2.in" }, 0.7);
    }, root);

    return () => ctx.revert(); // cleanup → cegah memory leak
  }, []);

  return (
    <section
      ref={root}
      className="showcase-section relative overflow-hidden bg-white md:h-screen"
    >
      {/* DESKTOP — stage radial (konten tengah + 4 gambar sudut absolute) */}
      <div className="showcase-container relative hidden h-full md:block">
        {/* Konten tengah (z-index lebih tinggi) — centering di wrapper, animasi di .showcase-content */}
        <div className="absolute left-1/2 top-1/2 z-20 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-6">
          <div className="showcase-content flex flex-col items-center text-center">
            <Copy />
          </div>
        </div>

        {/* 4 gambar sudut */}
        {corners.map((c) => (
          <figure
            key={c.cls}
            className={`${c.cls} showcase-image absolute ${c.pos} z-10 w-44 will-change-transform lg:w-52`}
          >
            <div className="overflow-hidden rounded-2xl shadow-2xl shadow-ink-900/25 ring-1 ring-white/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(c.src)}
                alt="Aksi padel"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </figure>
        ))}
      </div>

      {/* MOBILE — statis: konten lalu grid foto (tanpa pin/parallax) */}
      <div className="px-6 py-20 md:hidden">
        <div className="flex flex-col items-center text-center">
          <Copy />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3">
          {corners.map((c) => (
            <div key={c.cls} className="overflow-hidden rounded-2xl shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(c.src)}
                alt="Aksi padel"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
