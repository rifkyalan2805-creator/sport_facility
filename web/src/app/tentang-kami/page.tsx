import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eyebrow } from "@/components/brand/Button";
import CompanyProfile from "@/components/about/CompanyProfile";
import LocationSection from "@/components/about/LocationSection";
import SportStatement from "@/components/about/SportStatement";
import ContactSection from "@/components/about/ContactSection";

export const metadata: Metadata = {
  title: "Tentang Kami — ISTANA DIENG CLUB HOUSE",
  description:
    "Profil ISTANA DIENG CLUB HOUSE — klub olahraga terpadu di Perumahan Istana Dieng, Bandulan, Kec. Sukun, Kota Malang. Lapangan padel, tenis, dan kolam renang yang dikelola satu tim sejak tahun 2000.",
};

/**
 * Halaman Tentang Kami — empat section sesuai brief pemilik:
 *
 *  1. Profil perusahaan, layanan, dan riwayat sejak 2000 (satu-satunya section
 *     berfoto: tiga foto sinematik bergradasi hitam).
 *  2. Lokasi — peta Google embed tanpa API key, tampil kecil lalu diperbesar.
 *  3. Pernyataan standar klub + tautan kembali ke beranda.
 *  4. Ajakan bertanya soal info terbaru dan agenda mendatang.
 *
 * Sampul di berkas ini sengaja tanpa gambar supaya jatah foto halaman tetap
 * tiga, seluruhnya terkumpul di section Profil.
 */
export default function TentangKamiPage() {
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
            <Eyebrow tone="gradient">Tentang Kami</Eyebrow>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-none tracking-hero text-paper-white sm:text-6xl md:text-7xl">
              Sejak tahun 2000,
              <br />
              di alamat yang
              <br />
              sama.
            </h1>
            <p className="mt-8 max-w-xl font-display text-base leading-relaxed text-paper-white/70 sm:text-lg">
              Klub olahraga terpadu di Perumahan Istana Dieng, Kota Malang —
              lapangan padel, lapangan tenis, dan kolam renang yang dikelola
              satu tim dalam satu sistem reservasi.
            </p>
          </div>
        </section>

        <CompanyProfile />
        <LocationSection />
        <SportStatement />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
