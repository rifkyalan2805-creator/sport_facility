"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageNavProps {
  className?: string;
  showBack?: boolean;
  showHome?: boolean;
}

const btnCls =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/10 bg-white/70 text-ink-600 outline-none transition-colors duration-200 hover:bg-ink-900/5 hover:text-ink-900 focus-visible:ring-4 focus-visible:ring-neon-purple/30";

/**
 * Navigasi ringkas: tombol Kembali (router.back() dengan fallback ke beranda
 * bila tak ada riwayat) + tombol Beranda. Ikon SVG inline (tanpa dependensi).
 */
export default function PageNav({
  className = "",
  showBack = true,
  showHome = true,
}: PageNavProps) {
  const router = useRouter();

  function onBack() {
    // Bila halaman dibuka langsung (tanpa riwayat internal), arahkan ke beranda
    // supaya tombol tidak "keluar" dari situs atau mentok.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  if (!showBack && !showHome) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showBack && (
        <button type="button" onClick={onBack} aria-label="Kembali ke halaman sebelumnya" className={btnCls}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {showHome && (
        <Link href="/" aria-label="Ke beranda" className={btnCls}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
        </Link>
      )}
    </div>
  );
}
