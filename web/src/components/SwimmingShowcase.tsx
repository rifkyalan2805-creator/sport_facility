"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 6 foto kolam renang (mudah diganti — cukup ubah `src`).
const photos = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: n,
  src: `/images/sport club/swimming pools/swimming ${n}.jpg`,
  alt: `Fasilitas kolam renang ${n}`,
}));

export default function SwimmingShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!window.matchMedia("(min-width: 768px)").matches) return;
      const el = track.current!;
      // Jarak geser = lebar track yang melebihi layar.
      const distance = () => el.scrollWidth - window.innerWidth;

      const photos = gsap.utils.toArray<HTMLElement>(".swim-photo");

      // Pudarkan tiap FOTO saat tepinya menyentuh area copy (copy TIDAK memudar).
      const fadePhotos = () => {
        if (!copy.current) return;
        const boundary = copy.current.getBoundingClientRect().right;
        const fadeStart = boundary + 60; // mulai memudar saat mendekati copy
        const fadeEnd = boundary - 120; // hilang setelah melewati copy
        photos.forEach((p) => {
          const left = p.getBoundingClientRect().left;
          const o = Math.max(0, Math.min(1, (left - fadeEnd) / (fadeStart - fadeEnd)));
          gsap.set(p, { opacity: o });
        });
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: fadePhotos,
          onRefresh: fadePhotos,
        },
      });
      // Foto bergeser horizontal sepanjang scroll (perilaku foto TIDAK diubah).
      tl.to(el, { x: () => -distance(), ease: "none", duration: 1 }, 0);
      // Copy di-counter-translate agar TERKUNCI & tetap terlihat sepanjang scroll.
      tl.to(copy.current, { x: () => distance(), ease: "none", duration: 1 }, 0);

      // Bob mengambang per foto (efek "air") — selalu berjalan halus.
      gsap.utils.toArray<HTMLElement>(".swim-photo").forEach((photo, i) => {
        gsap.to(photo, {
          y: i % 2 ? 22 : -22,
          duration: 2.4 + i * 0.25,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert(); // cleanup → cegah memory leak
  }, []);

  return (
    <section
      ref={root}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-sky-50 to-blue-50 md:h-screen"
    >
      <div
        ref={track}
        className="flex w-full flex-col gap-10 px-6 py-20 md:h-full md:w-max md:flex-row md:items-center md:gap-12 md:px-[6vw] md:py-0"
      >
        {/* Panel teks — terkunci di tempat lalu memudar saat foto bergeser. */}
        <div ref={copy} className="relative z-20 shrink-0 md:w-[44vw] md:pr-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
            Aqua Ecosystem
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            Selami Gaya Hidup Baru di{" "}
            <span className="text-gradient-neon">Ekosistem Renang</span> Kami
          </h2>
          <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-500">
            Lebih dari sekadar tempat berenang, kami menghadirkan ekosistem air
            yang memadukan kebugaran, relaksasi, dan komunitas. Nikmati akses ke
            fasilitas kolam renang berstandar olimpiade, bimbingan dari pelatih
            profesional untuk segala usia, hingga komunitas yang suportif.
            Segarkan tubuhmu, tingkatkan teknikmu, dan temukan ritme terbaikmu
            bersama kami.
          </p>
          <Link
            href="/harga/pool"
            className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-neon-blue/25 transition-transform duration-200 hover:scale-[1.03]"
          >
            Daftar Member &amp; Mulai Berenang
          </Link>

          <p className="mt-8 hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-400 md:flex">
            Scroll
            <span aria-hidden className="text-base">
              &rarr;
            </span>
          </p>
        </div>

        {/* 6 foto sebagai dekorasi — staggered atas/bawah + bob mengambang */}
        {photos.map((p, i) => (
          <figure
            key={p.id}
            className={`swim-photo shrink-0 md:w-[30vw] ${
              i % 2 ? "md:mt-32" : "md:mb-32"
            }`}
          >
            <div className="overflow-hidden rounded-[28px] shadow-xl shadow-blue-900/10 ring-1 ring-white/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(p.src)}
                alt={p.alt}
                loading="lazy"
                className="h-72 w-full object-cover md:h-[52vh]"
              />
            </div>
            <figcaption className="mt-3 text-sm font-medium tracking-wide text-ink-400">
              Swimming{" "}
              <span className="text-ink-700">
                {String(p.id).padStart(2, "0")}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
