import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsIndex from "@/components/news/NewsIndex";

export const metadata: Metadata = {
  title: "Berita — ISTANA DIENG CLUB HOUSE",
  description:
    "Kabar terbaru ISTANA DIENG CLUB HOUSE — agenda, turnamen, perubahan jam operasional, dan kabar fasilitas padel, tenis, serta kolam renang.",
};

/**
 * Halaman Berita — isinya datang dari CMS (admin → Konten → Berita), bukan
 * ditulis di berkas ini. Hanya berita berstatus "published" yang sampai ke
 * pengunjung; admin yang sedang login ikut melihat draft supaya bisa
 * memeriksa tampilannya sebelum diterbitkan.
 *
 * Halaman ini server component semata-mata agar `metadata` di atas terkirim;
 * pengambilan datanya ada di NewsIndex (client, TanStack Query).
 */
export default function BeritaPage() {
  return (
    <>
      {/* `light`: bar mulai transparan di atas sampul gelap, lalu terisi saat digulir. */}
      <Navbar tone="light" />
      <NewsIndex />
      <Footer />
    </>
  );
}
