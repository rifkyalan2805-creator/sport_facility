import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HargaPadelPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 pt-32 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-pink" />
          Padel
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Harga &amp; Jadwal <span className="text-gradient-neon">Padel</span>
        </h1>
        <p className="mt-4 max-w-md text-ink-500">
          Jadwal ketersediaan lapangan padel dan harga (normal &amp; off-peak
          06:00–15:00) sedang disiapkan dan akan hadir di halaman ini.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-ink-900/5"
        >
          ← Kembali ke Beranda
        </Link>
      </main>
      <Footer />
    </>
  );
}
