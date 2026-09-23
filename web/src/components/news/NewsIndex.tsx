"use client";

import { useMemo, useState } from "react";
import { Eyebrow } from "@/components/brand/Button";
import NewsCard from "@/components/news/NewsCard";
import { useNewsList } from "@/lib/queries";

const ALL = "all";

export default function NewsIndex() {
  const { data: items = [], isLoading, isError } = useNewsList();
  const [active, setActive] = useState<string>(ALL);

  // Kategori diturunkan dari isi, bukan daftar tetap: admin bebas mengetik
  // kategori baru di CMS dan filternya muncul sendiri.
  const categories = useMemo(
    () => Array.from(new Set(items.map((n) => n.category))).sort(),
    [items],
  );

  const filtered = useMemo(
    () => (active === ALL ? items : items.filter((n) => n.category === active)),
    [items, active],
  );

  // Berita terbaru tampil sebagai sorotan; sisanya masuk grid tiga kolom.
  const [lead, ...rest] = filtered;

  return (
    <main>
      {/* ---- Sampul halaman ---- */}
      <section className="relative isolate flex min-h-[46vh] w-full items-end overflow-hidden bg-obsidian">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, #fff 0 1px, transparent 1px 7px)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-14 pt-40 md:pb-16">
          <Eyebrow tone="gradient">Berita</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-none tracking-hero text-paper-white sm:text-6xl md:text-7xl">
            Kabar dari
            <br />
            lapangan.
          </h1>
          <p className="mt-8 max-w-xl font-display text-base leading-relaxed text-paper-white/70 sm:text-lg">
            Agenda, turnamen, perubahan jam operasional, dan kabar fasilitas —
            ditulis langsung oleh pengelola klub.
          </p>
        </div>
      </section>

      <section className="bg-paper-white">
        {/* ---- Filter kategori ---- */}
        {categories.length > 1 && (
          <div className="border-b border-obsidian/10 px-6">
            <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-7 gap-y-3 py-5">
              {[ALL, ...categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActive(c)}
                  aria-pressed={active === c}
                  className={`font-condensed text-xs font-semibold uppercase tracking-eyebrow outline-none transition-colors duration-200 focus-visible:text-obsidian ${
                    active === c
                      ? "text-obsidian underline decoration-2 underline-offset-8"
                      : "text-graphite hover:text-obsidian"
                  }`}
                >
                  {c === ALL ? "Semua" : c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24">
          {isLoading ? (
            <div className="space-y-12">
              {/* 16:9 — rasio paling lazim, jadi pergeseran tata letak saat
                  gambar aslinya masuk sekecil mungkin. */}
              <div className="aspect-[16/9] animate-pulse rounded-lg bg-obsidian/5" />
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  /* h-60 = tinggi area gambar kartu grid (GRID_MEDIA_H). */
                  <div key={i} className="h-60 animate-pulse rounded-lg bg-obsidian/5" />
                ))}
              </div>
            </div>
          ) : isError ? (
            <p className="py-16 text-center font-display text-base text-graphite">
              Gagal memuat berita. Coba muat ulang halaman ini sebentar lagi.
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center font-display text-base text-graphite">
              {items.length === 0
                ? "Belum ada berita yang diterbitkan."
                : "Tidak ada berita di kategori ini."}
            </p>
          ) : (
            <>
              <NewsCard item={lead} feature />
              {rest.length > 0 && (
                <div className="mt-16 grid gap-x-8 gap-y-12 border-t border-obsidian/10 pt-16 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((n) => (
                    <NewsCard key={n.id} item={n} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
