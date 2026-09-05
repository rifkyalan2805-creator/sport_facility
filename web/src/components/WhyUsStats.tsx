"use client";

import { useEffect, useRef } from "react";
import { Eyebrow } from "@/components/brand/Button";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Seksi "mengapa kami".
 *
 * CATATAN ISI: seksi ini sebelumnya memuat angka karangan (2M+ anggota,
 * 1M+ pengunjung, rating 4.9 dari 2.500+ ulasan). Klaim seperti itu tidak
 * dapat dipertanggungjawabkan untuk klub nyata, jadi diganti dengan
 * kemampuan yang MEMANG dijalankan sistem ini — reservasi daring, kartu
 * anggota digital, tiket ber-QR, dan abonemen berjadwal tetap.
 * Bila ada angka resmi (jumlah anggota, rating), silakan pasang kembali.
 */

const DAYS = ["S", "S", "R", "K", "J", "S", "M"];

export default function WhyUsStats() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Orbit berputar terus (counter-rotate agar simpul tetap tegak).
      if (!reduce) {
        gsap.to(".orbit-ring", { rotation: 360, duration: 26, ease: "none", repeat: -1 });
        gsap.to(".orbit-icon", { rotation: -360, duration: 26, ease: "none", repeat: -1 });
      }

      if (reduce) return; // hormati reduce-motion → tampil tanpa animasi masuk

      gsap.from(".whyus-card", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: ".whyus-section", start: "top 80%", once: true },
      });

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
    <section
      ref={root}
      className="whyus-section bg-obsidian px-6 py-24 md:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <Eyebrow tone="light">Cara Kami Bekerja</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-black leading-none tracking-display text-paper-white sm:text-5xl">
            Dikelola seperti klub,
            <br />
            bukan seperti
            <br />
            lapangan sewaan.
          </h2>
          <div className="mt-8 h-px w-full bg-paper-white/15" />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-[repeat(2,minmax(240px,1fr))]">
          {/* Reservasi daring */}
          <div className="whyus-card flex flex-col justify-between rounded-xl bg-paper-white p-6 md:col-start-1 md:row-start-1">
            <div>
              <h3 className="font-display text-xl font-bold tracking-display text-obsidian">
                Ketersediaan yang jujur
              </h3>
              <p className="mt-3 font-display text-sm leading-relaxed text-graphite">
                Jadwal di situs ini dibaca langsung dari sistem operasional kami.
                Slot yang tampil kosong memang benar-benar kosong.
              </p>
            </div>
            <div className="mt-6">
              <div className="flex gap-1.5">
                {DAYS.map((d, i) => (
                  <span
                    key={i}
                    className="flex h-9 flex-1 items-center justify-center rounded-lg bg-obsidian/[0.06] font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                Buka setiap hari
              </p>
            </div>
          </div>

          {/* Kartu anggota digital */}
          <div className="whyus-card relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-paper-white p-6 md:col-start-2 md:row-start-1">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <div className="orbit-ring absolute inset-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 -ml-3 -mt-3 h-6 w-6"
                    style={{ transform: `rotate(${i * 90}deg) translateY(-64px)` }}
                  >
                    <span className="orbit-icon block h-6 w-6 rounded-lg border border-obsidian/15 bg-paper-white" />
                  </span>
                ))}
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-obsidian">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-paper-white" aria-hidden>
                  <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 4v8h16V9H4zm2 5h6v2H6v-2z" />
                </svg>
              </div>
            </div>
            <p className="mt-5 text-center font-display text-sm leading-relaxed text-graphite">
              Kartu anggota digital terbit otomatis begitu pembayaran selesai.
            </p>
          </div>

          {/* Abonemen */}
          <div className="whyus-card flex flex-col justify-between overflow-hidden rounded-xl bg-paper-white p-6 md:col-start-1 md:row-start-2">
            <div>
              <h3 className="font-display text-xl font-bold tracking-display text-obsidian">
                Jam tetap tiap minggu
              </h3>
              <p className="mt-3 font-display text-sm leading-relaxed text-graphite">
                Abonemen tenis mengunci jam bermain Anda, jadi tidak perlu
                berebut slot setiap pekan.
              </p>
            </div>
            <div
              className="mt-6 h-16 w-full rounded-lg"
              style={{
                backgroundImage:
                  "conic-gradient(#000000 90deg, transparent 90deg 180deg, #000000 180deg 270deg, transparent 270deg)",
                backgroundSize: "18px 18px",
                opacity: 0.1,
              }}
            />
          </div>

          {/* Foto + tiket QR */}
          <div className="whyus-card relative overflow-hidden rounded-xl bg-obsidian md:col-start-2 md:row-start-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              // `swimming 4` diganti: berkas itu memuat watermark fotografer.
              src={encodeURI("/images/sport club/swimming pools/swimming 6.jpg")}
              alt="Perenang di lintasan kolam"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-45 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <h3 className="font-display text-xl font-bold tracking-display text-paper-white">
                Tiket kolam ber-QR
              </h3>
              <p className="mt-2 font-display text-sm leading-relaxed text-paper-white/75">
                Dipindai langsung di pintu masuk — tanpa antre di loket.
              </p>
            </div>
          </div>

          {/* Kolom kanan — penjelasan */}
          <div className="whyus-text-col flex flex-col justify-between rounded-xl bg-sand-beige p-7 md:col-start-3 md:row-span-2 md:row-start-1">
            <div>
              <h3 className="font-display text-2xl font-bold leading-tight tracking-display text-obsidian">
                Satu tim, satu standar perawatan.
              </h3>
              <p className="mt-5 font-display text-sm leading-relaxed text-graphite">
                ISTANA DIENG CLUB HOUSE mengelola lapangan padel, lapangan tenis,
                dan kolam renang di bawah satu manajemen. Artinya jadwal
                perawatan, standar kebersihan, dan penanganan keluhan mengikuti
                prosedur yang sama di semua fasilitas.
              </p>
              <p className="mt-4 font-display text-sm leading-relaxed text-graphite">
                Reservasi, keanggotaan, dan pembayaran berjalan pada satu sistem,
                sehingga riwayat dan status Anda tidak tercecer di banyak tempat.
              </p>
            </div>
            <div className="mt-8 border-t border-obsidian/15 pt-6">
              <Eyebrow>Jam Operasional</Eyebrow>
              <p className="mt-3 font-display text-sm font-semibold text-obsidian">
                Setiap hari · 06.00 hingga 23.00 WIB
              </p>
              <p className="mt-1 font-display text-sm text-graphite">
                Reservasi daring dapat dilakukan kapan saja.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
