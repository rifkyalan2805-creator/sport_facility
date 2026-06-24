"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Tinggi batang "pixel chart" (tren naik 2016 → 2026).
const CHART_BARS = [18, 26, 30, 38, 34, 48, 56, 64, 78, 92];

function Stars() {
  return (
    <div className="flex items-center gap-1" aria-label="Rating 4.9 dari 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-5 w-5 fill-amber-400" aria-hidden>
          <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.64L17.9 21 12 17.6 6.1 21l1.15-7.09L2.5 9.27l6.6-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function WhyUsStats() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Orbit ikon berputar terus (counter-rotate agar ikon tetap tegak).
      if (!reduce) {
        gsap.to(".orbit-ring", { rotation: 360, duration: 22, ease: "none", repeat: -1 });
        gsap.to(".orbit-icon", { rotation: -360, duration: 22, ease: "none", repeat: -1 });
      }

      if (reduce) return; // hormati reduce-motion → konten tampil tanpa animasi masuk

      // Container fade-in
      gsap.from(".whyus-container", {
        opacity: 0,
        duration: 0.6,
        scrollTrigger: { trigger: ".whyus-section", start: "top 80%", once: true },
      });

      // Kartu-kartu: scale 0.85 + y 50 → normal, berurutan (stagger)
      gsap.from(".whyus-card", {
        opacity: 0,
        scale: 0.85,
        y: 50,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".whyus-section", start: "top 80%", once: true },
      });

      // Kolom teks kanan: fade + translateX
      gsap.from(".whyus-text-col", {
        opacity: 0,
        x: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".whyus-section", start: "top 75%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="whyus-section bg-[#1a1a1a] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
            Why Us
          </span>
          <h2 className="mt-3 text-balance text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl">
            Dipercaya komunitas yang{" "}
            <span className="text-gradient-neon font-medium">terus bertumbuh</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="whyus-container mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-[repeat(2,minmax(240px,1fr))]">
          {/* Kiri Atas — 2M+ + pixel chart */}
          <div className="whyus-card flex flex-col justify-between rounded-2xl bg-[#f5f5f5] p-6 md:col-start-1 md:row-start-1">
            <div>
              <p className="text-5xl font-bold text-black">2M+</p>
              <p className="mt-2 text-sm text-ink-500">
                people connected and forming communities.
              </p>
            </div>
            <div className="mt-6 flex h-20 items-end justify-between gap-1">
              {CHART_BARS.map((h, i) => (
                <span
                  key={i}
                  className="w-full rounded-[3px] bg-gradient-to-t from-neon-purple to-neon-pink"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-medium text-ink-400">
              <span>2016</span>
              <span>2026</span>
            </div>
          </div>

          {/* Tengah Atas — orbit + 5x */}
          <div className="whyus-card relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#f5f5f5] p-6 md:col-start-2 md:row-start-1">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="orbit-ring absolute inset-0">
                {["bg-neon-pink", "bg-neon-purple", "bg-neon-blue", "bg-amber-400"].map(
                  (c, i) => (
                    <span
                      key={i}
                      className="absolute left-1/2 top-1/2 -ml-4 -mt-4 h-8 w-8"
                      style={{ transform: `rotate(${i * 90}deg) translateY(-72px)` }}
                    >
                      <span
                        className={`orbit-icon flex h-8 w-8 items-center justify-center rounded-full ${c} shadow-md`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
                          <circle cx="12" cy="12" r="6" />
                        </svg>
                      </span>
                    </span>
                  ),
                )}
              </div>
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-black text-white">
                <span className="text-2xl font-bold leading-none">5x</span>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-ink-500">
              Quicker than competing firms.
            </p>
          </div>

          {/* Kanan Atas (kiri-bawah pada bento) — 1M+ + pattern checkerboard */}
          <div className="whyus-card flex flex-col justify-between overflow-hidden rounded-2xl bg-[#f5f5f5] p-6 md:col-start-1 md:row-start-2">
            <div>
              <p className="text-5xl font-bold text-black">1M+</p>
              <p className="mt-2 text-sm text-ink-500">
                people follow their exercise at our place.
              </p>
            </div>
            <div
              className="mt-6 h-16 w-full rounded-lg"
              style={{
                backgroundImage:
                  "conic-gradient(#1a1a1a 90deg, transparent 90deg 180deg, #1a1a1a 180deg 270deg, transparent 270deg)",
                backgroundSize: "18px 18px",
                opacity: 0.12,
              }}
            />
          </div>

          {/* Tengah Bawah — foto + 100+ */}
          <div className="whyus-card relative overflow-hidden rounded-2xl bg-black md:col-start-2 md:row-start-2">
            {/* Ganti src dengan foto team meeting Anda (mis. /images/team.jpg) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodeURI("/images/sport club/padel/paddle 2.jpg")}
              alt="Komunitas & kegiatan bersama"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <p className="text-5xl font-bold text-white">100+</p>
              <p className="mt-2 text-sm text-white/80">
                happiness activities and connect with other communities.
              </p>
            </div>
          </div>

          {/* Kanan (full height) — deskripsi + rating */}
          <div className="whyus-text-col flex flex-col justify-between rounded-2xl bg-[#f5f5f5] p-7 md:col-start-3 md:row-span-2 md:row-start-1">
            <div>
              <h3 className="text-2xl font-semibold text-black">
                Ekosistem olahraga, bukan sekadar tempat.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-500">
                SportHub menyatukan lapangan premium, kolam berstandar olimpiade,
                dan event komunitas dalam satu platform. Kami percaya olahraga
                terbaik lahir dari fasilitas hebat dan koneksi yang tulus.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-500">
                Dari pemula hingga atlet, ribuan member tumbuh bersama kami—berlatih,
                bertanding, dan membangun persahabatan setiap harinya.
              </p>
            </div>
            <div className="mt-8 border-t border-ink-900/10 pt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-black">4.9</span>
                <span className="text-sm text-ink-400">/ 5</span>
              </div>
              <div className="mt-2">
                <Stars />
              </div>
              <p className="mt-2 text-xs text-ink-400">
                Berdasarkan 2.500+ ulasan member.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
