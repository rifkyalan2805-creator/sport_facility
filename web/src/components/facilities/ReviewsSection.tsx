"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";
import { REVIEWS, formatReviewDate, initialsOf, type Review } from "@/lib/reviews";

/**
 * Ulasan pengunjung.
 *
 * Sumber datanya masih `REVIEWS` (data contoh di `lib/reviews.ts`) — lihat
 * catatan di berkas itu; nantinya diganti ulasan asli dari halaman /kontak.
 * Karena itu komponen ini menerima daftar lewat prop `items`, sehingga saat
 * datanya berpindah ke API cukup halaman yang berubah, bukan tampilannya.
 *
 * Gulir horizontal memakai scroll-snap asli browser (bukan pustaka carousel):
 * tetap bisa digulir dengan trackpad, sentuhan, dan keyboard, sementara dua
 * tombol panah hanya menambah kenyamanan bagi pengguna tetikus.
 */

/** Bintang penuh/kosong. Nilai dipangkas ke 0–5 agar data ganjil tidak merusak baris. */
function Stars({ rating }: { rating: number }) {
  const value = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span
      className="flex items-center gap-1"
      role="img"
      aria-label={`Penilaian ${value} dari 5 bintang`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 ${i < value ? "fill-obsidian" : "fill-obsidian/15"}`}
          aria-hidden
        >
          <path d="M12 2.5l2.9 5.9 6.6.9-4.8 4.6 1.2 6.5L12 17.3l-5.9 3.1 1.2-6.5L2.5 9.3l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article
      data-review-card
      className="flex w-[86%] shrink-0 snap-start flex-col rounded-xl border border-obsidian/10 bg-paper-white p-7 sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
    >
      {/* Tanda kutip dekoratif — sekadar penanda visual, disembunyikan dari SR. */}
      <span
        aria-hidden
        className="font-display text-6xl font-black leading-[0.6] tracking-display text-obsidian/10"
      >
        &ldquo;
      </span>

      <p className="mt-6 flex-1 font-display text-[15px] leading-relaxed text-obsidian/80">
        {review.text}
      </p>

      <div className="mt-7 flex items-center gap-4 border-t border-obsidian/10 pt-5">
        {/* Monogram, bukan foto: memasang potret orang yang tidak benar-benar
            mengulas akan menyesatkan. */}
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cloud-gray font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian"
        >
          {initialsOf(review.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-obsidian">
            {review.name}
          </p>
          <p className="mt-0.5 truncate font-display text-xs text-graphite">
            {review.facility} · {formatReviewDate(review.date)}
          </p>
        </div>
        <span className="ml-auto shrink-0">
          <Stars rating={review.rating} />
        </span>
      </div>
    </article>
  );
}

function ArrowButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Ulasan sebelumnya" : "Ulasan berikutnya"}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-obsidian/20 text-obsidian outline-none transition-colors duration-200 hover:border-obsidian hover:bg-obsidian hover:text-paper-white focus-visible:ring-4 focus-visible:ring-obsidian/20 disabled:pointer-events-none disabled:opacity-30 motion-reduce:transition-none"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d={dir === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}

export default function ReviewsSection({ items = REVIEWS }: { items?: Review[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEditorialReveal(root);

  // Ambang 4px meredam pembulatan sub-piksel yang membuat tombol berkedip
  // antara aktif dan nonaktif di ujung lintasan.
  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    // Lebar kartu ikut breakpoint → panjang lintasan berubah saat layar diubah.
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync, items.length]);

  function scrollByCard(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-review-card]");
    // gap-4 = 16px; bila kartu belum ada, mundur ke 80% lebar lintasan.
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <section ref={root} className="bg-paper-white px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div className="max-w-2xl">
            <div className={REVEAL_TEXT}>
              <Eyebrow>Ulasan Pengunjung</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
            >
              Kata mereka yang
              <br />
              sudah datang.
            </h2>
          </div>

          {items.length > 0 && (
            <div className={`${REVEAL_TEXT} hidden gap-2 md:flex`}>
              <ArrowButton dir="prev" disabled={!canPrev} onClick={() => scrollByCard(-1)} />
              <ArrowButton dir="next" disabled={!canNext} onClick={() => scrollByCard(1)} />
            </div>
          )}
        </div>

        <div className={`${REVEAL_TEXT} mt-8 h-px w-full bg-obsidian/10`} />
        <p
          className={`${REVEAL_TEXT} mt-6 max-w-xl font-display text-base leading-relaxed text-graphite`}
        >
          Ulasan dikirim pengunjung melalui halaman{" "}
          <Link
            href="/kontak"
            className="font-semibold text-obsidian underline decoration-obsidian/30 underline-offset-4 outline-none transition-colors duration-200 hover:decoration-obsidian focus-visible:decoration-obsidian"
          >
            Kontak
          </Link>{" "}
          dan ditampilkan apa adanya, termasuk yang berisi catatan perbaikan.
        </p>

        {items.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-obsidian/20 px-7 py-12 text-center">
            <p className="font-display text-base text-graphite">
              Belum ada ulasan yang tayang.
            </p>
            <Link
              href="/kontak"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-obsidian px-6 py-2.5 font-condensed text-xs font-semibold uppercase tracking-eyebrow text-paper-white outline-none transition-colors duration-200 hover:bg-obsidian/85 focus-visible:ring-4 focus-visible:ring-obsidian/20 sm:text-sm"
            >
              Jadi yang pertama menulis
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        ) : (
          <>
            <div
              ref={track}
              tabIndex={0}
              role="group"
              aria-label="Daftar ulasan pengunjung"
              className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 outline-none [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-4 focus-visible:ring-obsidian/15 [&::-webkit-scrollbar]:hidden"
            >
              {items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Panah versi mobile — di bawah lintasan agar tidak menutupi kartu. */}
            <div className="mt-6 flex gap-2 md:hidden">
              <ArrowButton dir="prev" disabled={!canPrev} onClick={() => scrollByCard(-1)} />
              <ArrowButton dir="next" disabled={!canNext} onClick={() => scrollByCard(1)} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
