import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eyebrow } from "@/components/brand/Button";
import LocationSection from "@/components/about/LocationSection";
import ChannelGrid from "@/components/contact/ChannelGrid";
import MessageForm from "@/components/contact/MessageForm";
import FaqSection from "@/components/contact/FaqSection";
import {
  JAM_OPERASIONAL_RINGKAS,
  LOKASI,
  WAKTU_BALAS,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: "Kontak — ISTANA DIENG CLUB HOUSE",
  description:
    "Hubungi ISTANA DIENG CLUB HOUSE lewat WhatsApp, telepon, atau email untuk menanyakan ketersediaan lapangan padel dan tenis, tiket kolam renang, keanggotaan, serta penyewaan area acara di Bandulan, Kota Malang.",
};

/**
 * Halaman Kontak — lima blok:
 *
 *  1. Sampul obsidian tanpa gambar, mengikuti /tentang-kami.
 *  2. Ringkasan meta: jam buka, waktu balas, lokasi.
 *  3. Kanal yang bisa diklik dan disalin.
 *  4. Formulir yang menyerahkan pesan ke WhatsApp atau email pengunjung.
 *  5. Lokasi (komponen yang sama dengan /tentang-kami) lalu FAQ.
 *
 * Latarnya berselang-seling paper → cloud → paper → cloud, sehingga footer
 * yang berlatar obsidian tetap jatuh sebagai pergantian nada, bukan blok gelap
 * kedua yang berdempetan. Pita ajakan penutup sengaja tidak dibuat: footer
 * sudah memuatnya.
 */
const META = [
  { label: "Jam Operasional", value: `Setiap hari · ${JAM_OPERASIONAL_RINGKAS}` },
  { label: "Waktu Balas", value: WAKTU_BALAS },
  { label: "Lokasi", value: LOKASI.kotaRingkas },
];

export default function KontakPage() {
  return (
    <>
      {/* `light`: bar mulai transparan di atas sampul gelap, lalu terisi saat digulir. */}
      <Navbar tone="light" />

      <main>
        {/* ---- Sampul halaman ---- */}
        <section className="relative isolate flex min-h-[58vh] w-full items-end overflow-hidden bg-obsidian">
          {/* Garis rambut horizontal samar — memberi tekstur pada bidang hitam
              tanpa memakai gambar. Murni CSS, tidak menambah permintaan aset. */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(180deg, #fff 0 1px, transparent 1px 7px)",
            }}
          />

          <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-16 pt-40 md:pb-20">
            <Eyebrow tone="gradient">Kontak</Eyebrow>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-none tracking-hero text-paper-white sm:text-6xl md:text-7xl">
              Bicara langsung
              <br />
              dengan kami.
            </h1>
            <p className="mt-8 max-w-xl font-display text-base leading-relaxed text-paper-white/70 sm:text-lg">
              Ketersediaan lapangan, harga, keanggotaan, sampai penyewaan area
              untuk acara — tanyakan lewat kanal yang paling nyaman untuk Anda,
              dan jawabannya datang dari tim yang sama.
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

        <ChannelGrid />
        <MessageForm />
        {/* `paper` menjaga selang-seling latar: section ini diapit dua bidang abu. */}
        <LocationSection surface="paper" />
        <FaqSection />
      </main>

      <Footer />
    </>
  );
}
