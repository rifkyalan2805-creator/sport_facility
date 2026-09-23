"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eyebrow } from "@/components/brand/Button";
import { newsDate } from "@/components/news/NewsCard";
import { useNewsItem } from "@/lib/queries";

/** Teks polos dari CMS → paragraf. Pemisahnya baris kosong. */
function paragraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function Article({ slug }: { slug: string }) {
  const { data: item, isLoading, isError } = useNewsItem(slug);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-40">
        <div className="h-4 w-40 animate-pulse rounded bg-obsidian/10" />
        <div className="mt-6 h-14 w-full max-w-3xl animate-pulse rounded bg-obsidian/10" />
        <div className="mt-12 aspect-[16/9] animate-pulse rounded-lg bg-obsidian/5" />
      </main>
    );
  }

  if (isError || !item) {
    return (
      <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-40 text-center">
        <p className="font-display text-lg text-obsidian">Berita tidak ditemukan.</p>
        <p className="mt-2 font-display text-sm text-graphite">
          Mungkin sudah dihapus, atau belum diterbitkan.
        </p>
        <Link
          href="/berita"
          className="mt-8 inline-flex font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian underline decoration-2 underline-offset-8 outline-none"
        >
          ← Kembali ke daftar berita
        </Link>
      </main>
    );
  }

  const body = paragraphs(item.content);

  return (
    <main className="bg-paper-white">
      <article className="mx-auto max-w-[1200px] px-6 pb-24 pt-32 md:pt-40">
        <Link
          href="/berita"
          className="inline-flex font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite outline-none transition-colors hover:text-obsidian focus-visible:text-obsidian"
        >
          ← Berita
        </Link>

        {/* ---- Kepala artikel ---- */}
        <header className="mt-8 max-w-4xl">
          <Eyebrow>
            {item.category} · {newsDate(item)}
            {item.status !== "published" ? ` · ${item.status}` : ""}
          </Eyebrow>
          <h1 className="mt-5 font-display text-4xl font-black leading-[1.05] tracking-hero text-obsidian sm:text-5xl md:text-6xl">
            {item.title}
          </h1>
          {item.excerpt && (
            <p className="mt-8 max-w-2xl font-display text-lg leading-relaxed text-obsidian/80 sm:text-xl">
              {item.excerpt}
            </p>
          )}
          {item.author && (
            <p className="mt-8 border-t border-obsidian/10 pt-5 font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
              Ditulis oleh {item.author}
            </p>
          )}
        </header>

        {/* ---- Cover 16:9 ---- */}
        {item.cover_url && (
          /* `w-fit`: blok gambar menyusut mengikuti gambarnya, jadi tidak ada
             bidang kosong di samping berapa pun rasionya — dan tetap rata kiri
             dengan judul & badan artikel, bukan melayang di tengah. */
          <figure className="mt-12 w-fit max-w-full">
            <div className="overflow-hidden rounded-lg bg-sand-beige ring-1 ring-obsidian/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(item.cover_url)}
                alt={item.cover_alt ?? item.title}
                className="block max-h-[70vh] w-auto max-w-full object-contain md:max-h-[80vh]"
              />
            </div>
            {item.cover_alt && (
              <figcaption className="max-w-[720px] px-1 pt-3 font-display text-sm text-graphite">
                {item.cover_alt}
              </figcaption>
            )}
          </figure>
        )}

        {/* ---- Isi ---- */}
        {/* Lebar baca dibatasi ~720px: di atas itu mata kehilangan awal baris
            berikutnya. Gambar di atas sengaja tetap selebar 1200px. */}
        <div className="mt-14 max-w-[720px] space-y-6">
          {body.map((p, i) => (
            <p
              key={i}
              className="whitespace-pre-line font-display text-base leading-relaxed text-obsidian/85 sm:text-lg"
            >
              {p}
            </p>
          ))}
        </div>

        <div className="mt-16 max-w-[720px] border-t border-obsidian/10 pt-8">
          <Link
            href="/berita"
            className="inline-flex font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian underline decoration-2 underline-offset-8 outline-none"
          >
            ← Semua berita
          </Link>
        </div>
      </article>
    </main>
  );
}

/**
 * Detail berita. Draft & arsip hanya bisa dibuka admin (backend membalas 404
 * untuk pengunjung biasa), jadi admin bisa memeriksa tampilan sebelum terbit.
 */
export default function BeritaDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <>
      <Navbar />
      <Article slug={slug} />
      <Footer />
    </>
  );
}
