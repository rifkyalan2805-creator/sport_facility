import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eyebrow } from "@/components/brand/Button";
import FacilityGrid from "@/components/facilities/FacilityGrid";
import ReviewsSection from "@/components/facilities/ReviewsSection";
import { JAM_OPERASIONAL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Fasilitas — ISTANA DIENG CLUB HOUSE",
  description:
    "Kamar mandi dengan air panas, sabun & shampoo, musholla, parkir luas, gazebo tepi kolam, dan pertolongan pertama — fasilitas pendukung untuk pengunjung padel, tenis, dan kolam renang.",
};

/**
 * Foto sampul: hall tenis milik klub sendiri (bukan foto stok), lanskap penuh
 * dan tanpa orang — aman dipakai besar. Didesaturasi + digelapkan seperti hero
 * beranda supaya teks putih tetap terbaca.
 */
const COVER = "/images/sport club/Tennis Court/Tennis Court 1.jpeg";

/** Ringkasan di bawah sampul — semuanya fakta yang sudah dipakai di beranda. */
const META = [
  { label: "Jam Operasional", value: JAM_OPERASIONAL },
  { label: "Berlaku Untuk", value: "Pengunjung padel, tenis & kolam renang" },
  { label: "Pengelolaan", value: "Satu area, satu standar perawatan" },
];

export default function FasilitasPage() {
  return (
    <>
      {/* `light`: bar mulai transparan di atas sampul gelap, lalu terisi saat digulir. */}
      <Navbar tone="light" />

      <main>
        {/* ---- Sampul halaman ---- */}
        <section className="relative isolate flex min-h-[70vh] w-full items-end overflow-hidden bg-obsidian">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(COVER)}
            alt="Hall tenis indoor ISTANA DIENG CLUB HOUSE"
            // Sampul adalah LCP halaman ini → jangan di-lazy-load.
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover opacity-55 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/35" />

          <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 pt-36 md:pb-20">
            <Eyebrow tone="light">Fasilitas</Eyebrow>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-none tracking-hero text-paper-white sm:text-6xl md:text-7xl">
              Fasilitas pendukung,
              <br />
              dirawat sama
              <br />
              seriusnya.
            </h1>
            <p className="mt-8 max-w-xl font-display text-base leading-relaxed text-paper-white/70 sm:text-lg">
              Kamar mandi air panas, musholla, gazebo tepi kolam, sampai kotak
              P3K. Hal-hal seperti inilah yang menentukan apakah satu jam di
              sini terasa nyaman atau merepotkan.
            </p>
          </div>
        </section>

        {/* ---- Ringkasan singkat ---- */}
        <section className="border-b border-obsidian/10 bg-paper-white px-6">
          <dl className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-obsidian/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {META.map((m) => (
              <div key={m.label} className="py-7 md:px-8 md:first:pl-0 md:last:pr-0">
                <dt className="font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                  {m.label}
                </dt>
                <dd className="mt-2 font-display text-base font-semibold tracking-tight text-obsidian">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <FacilityGrid />
        <ReviewsSection />
      </main>

      <Footer />
    </>
  );
}
