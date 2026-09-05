"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";
import {
  JAM_OPERASIONAL,
  LOKASI,
  MAPS_DIR_URL as DIR_URL,
  MAPS_URL,
  mapEmbedSrc as embedSrc,
} from "@/lib/contact";

/**
 * Lokasi klub — dipakai di /tentang-kami dan /kontak.
 *
 * Peta memakai iframe `output=embed` milik Google Maps, yang TIDAK memerlukan
 * API key maupun penagihan: URL-nya cukup berisi koordinat, level zoom, dan
 * bahasa. Konsekuensinya kita tidak bisa menata gaya isi petanya (tidak ada
 * styling JSON seperti Maps JavaScript API), jadi penyelarasan dengan sistem
 * desain dilakukan di sekelilingnya — bingkai, tipografi, tombol — plus filter
 * CSS ringan pada pratinjau kecil.
 *
 * Peta tampil kecil dulu (hemat, tidak mencuri fokus dari teks), lalu dibuka
 * besar dalam dialog saat diklik. Iframe pratinjau dimatikan pointer-nya supaya
 * gulir halaman tidak "tersangkut" di dalam peta saat pengunjung menggulir.
 *
 * Koordinat, alamat, dan jam buka datang dari `lib/contact.ts` supaya tidak
 * pernah berbeda dengan yang tertulis di halaman kontak.
 */

/** Tombol dalam dialog — bukan <Button>, karena tujuannya di luar aplikasi. */
const BTN_BASE =
  "inline-flex items-center justify-center rounded-lg px-6 py-2.5 font-condensed text-xs font-semibold uppercase tracking-eyebrow outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-obsidian/20 sm:text-sm";

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden
    >
      <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function GridIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

/**
 * Dialog peta besar.
 *
 * Dirender lewat portal ke <body> supaya `position: fixed` tidak pernah
 * terperangkap containing block dari transform yang dipasang GSAP pada elemen
 * `.reveal-text` di sekitarnya.
 */
function MapDialog({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      // Kembalikan fokus ke tombol pratinjau — tanpa ini fokus keyboard
      // terlempar ke awal dokumen setiap kali dialog ditutup.
      prevFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Peta lokasi ${LOKASI.nama}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-obsidian/70 p-4 backdrop-blur-[2px] sm:p-6"
    >
      <div className="flex max-h-[88vh] w-full max-w-[960px] animate-fade-up flex-col overflow-hidden rounded-xl bg-paper-white">
        <header className="flex items-start gap-4 border-b border-obsidian/10 px-6 py-5">
          <div className="min-w-0">
            <p className="font-display text-base font-semibold tracking-tight text-obsidian">
              {LOKASI.nama}
            </p>
            <p className="mt-1 font-display text-sm leading-relaxed text-graphite">
              {LOKASI.alamat}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup peta"
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-obsidian/15 text-obsidian outline-none transition-colors duration-200 hover:border-obsidian hover:bg-obsidian hover:text-paper-white focus-visible:ring-4 focus-visible:ring-obsidian/20"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-[320px] flex-1 bg-cloud-gray">
          <iframe
            title={`Peta besar lokasi ${LOKASI.nama}`}
            src={embedSrc(LOKASI.zoom + 1)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-full min-h-[320px] w-full border-0"
          />
        </div>

        <footer className="flex flex-wrap gap-3 border-t border-obsidian/10 px-6 py-5">
          <a
            href={DIR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_BASE} bg-obsidian text-paper-white hover:bg-obsidian/85`}
          >
            Petunjuk Arah
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_BASE} border border-obsidian/15 text-obsidian hover:border-obsidian/40 hover:bg-obsidian/[0.03]`}
          >
            Buka di Google Maps
          </a>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/**
 * `surface` menjaga irama latar berselang-seling halaman pemanggil: di
 * /tentang-kami section ini duduk di antara dua bidang putih (`cloud`, bawaan),
 * sedangkan di /kontak ia jatuh di antara dua bidang abu (`paper`). Kartu di
 * dalamnya selalu mengambil nilai yang berlawanan dengan latar section supaya
 * batasnya tetap terbaca tanpa perlu bayangan.
 */
export default function LocationSection({
  surface = "cloud",
}: {
  surface?: "cloud" | "paper";
}) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEditorialReveal(root);

  const close = useCallback(() => setOpen(false), []);

  const onPaper = surface === "paper";
  const sectionBg = onPaper ? "bg-paper-white" : "bg-cloud-gray";
  const cardBg = onPaper ? "bg-cloud-gray/60" : "bg-paper-white";
  const chipBg = onPaper ? "bg-paper-white" : "bg-cloud-gray";

  return (
    <section ref={root} id="lokasi" className={`${sectionBg} px-6 py-24 md:py-28`}>
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <div className={REVEAL_TEXT}>
            <Eyebrow>Lokasi</Eyebrow>
          </div>
          <h2
            className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
          >
            Mudah dicari,
            <br />
            mudah diparkir.
          </h2>
          <p
            className={`${REVEAL_TEXT} mt-7 font-display text-base leading-relaxed text-graphite`}
          >
            Kami berada di dalam kawasan Perumahan Istana Dieng, Bandulan —
            beberapa menit dari Jalan Raya Dieng, dengan area parkir yang
            menampung roda dua maupun roda empat. Klik petanya untuk melihat
            tampilan penuh dan mengambil petunjuk arah.
          </p>
        </div>

        {/* ---- Kartu lokasi ---- */}
        <div
          className={`${REVEAL_TEXT} mt-12 grid gap-8 rounded-xl border border-obsidian/10 ${cardBg} p-7 sm:p-9 md:grid-cols-[minmax(0,1fr)_320px] md:items-center`}
        >
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight text-obsidian">
              {LOKASI.nama}
            </h3>

            <dl className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <dt className="sr-only">Alamat</dt>
                <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-obsidian/35" />
                <dd className="font-display text-sm leading-relaxed text-graphite">
                  {LOKASI.alamat}
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <dt className="sr-only">Plus Code</dt>
                <GridIcon className="mt-0.5 h-4 w-4 shrink-0 text-obsidian/35" />
                <dd className="font-display text-sm leading-relaxed text-graphite">
                  Plus Code{" "}
                  <code
                    className={`rounded ${chipBg} px-1.5 py-0.5 font-mono text-[0.9em] text-obsidian`}
                  >
                    {LOKASI.plusCode}
                  </code>
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <dt className="sr-only">Jam operasional</dt>
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-obsidian/35" />
                <dd className="font-display text-sm leading-relaxed text-graphite">
                  {JAM_OPERASIONAL}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={DIR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_BASE} bg-obsidian text-paper-white hover:bg-obsidian/85`}
              >
                Petunjuk Arah
              </a>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_BASE} border border-obsidian/15 text-obsidian hover:border-obsidian/40 hover:bg-obsidian/[0.03]`}
              >
                Buka di Google Maps
              </a>
            </div>
          </div>

          {/* Pratinjau peta — tombol, bukan div ber-onClick, supaya bisa
              dijangkau Tab dan diaktifkan dengan Enter/Space tanpa ARIA tambahan. */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Perbesar peta lokasi"
            className="group relative block h-[190px] w-full cursor-zoom-in overflow-hidden rounded-lg border border-obsidian/10 bg-cloud-gray outline-none focus-visible:ring-4 focus-visible:ring-obsidian/20 md:h-[220px]"
          >
            <iframe
              title="Pratinjau peta lokasi"
              src={embedSrc(LOKASI.zoom)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full border-0 grayscale-[0.6] transition-[filter] duration-500 group-hover:grayscale-0 motion-reduce:transition-none"
            />
            <span
              aria-hidden
              className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/45 to-transparent to-60% p-4 transition-colors duration-200"
            >
              <span className="inline-flex items-center gap-2 rounded-lg bg-paper-white px-4 py-2 font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                >
                  <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" />
                </svg>
                Perbesar Peta
              </span>
            </span>
          </button>
        </div>
      </div>

      {open && <MapDialog onClose={close} />}
    </section>
  );
}
