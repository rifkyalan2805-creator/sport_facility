import Link from "next/link";
import { formatDateID } from "@/lib/format";
import type { NewsItem } from "@/lib/queries";

/**
 * Tanggal yang ditampilkan: tanggal terbit, dengan tanggal dibuat sebagai
 * cadangan — draft yang dilihat admin belum punya published_at.
 */
export function newsDate(item: NewsItem): string {
  return formatDateID(item.published_at ?? item.created_at);
}

/**
 * Ringkasan kartu. Kalau admin tidak mengisi `excerpt`, ambil dari awal isi —
 * dipotong di batas kata supaya tidak terpenggal di tengah kata.
 */
export function newsExcerpt(item: NewsItem, max = 150): string {
  const raw = (item.excerpt ?? item.content).replace(/\s+/g, " ").trim();
  if (raw.length <= max) return raw;
  const cut = raw.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/**
 * Bingkai gambar, sama di semua susunan.
 *
 *  - `bg-sand-beige`: mat hangat dari palet DESIGN.md. Bidang sisa di sekitar
 *    gambar yang rasionya tidak pas jadi terbaca sebagai paspartu yang
 *    disengaja — abu-abu samar malah terbaca seperti render yang gagal.
 *  - `ring`: garis rambut. Tanpa ini tangkapan layar berlatar putih lenyap
 *    ke halaman yang juga putih, tanpa tepi sama sekali.
 */
const FRAME = "relative overflow-hidden rounded-lg bg-sand-beige ring-1 ring-obsidian/10";

/** Perbesaran hanya saat hover — gambar tampil utuh dalam keadaan diam. */
const ZOOM = "transition-transform duration-500 ease-out group-hover:scale-[1.06]";

/** Tinggi area gambar kartu grid. Sama untuk SEMUA kartu, apa pun rasionya,
 *  supaya judul antar kolom tetap sejajar — dan gambar potret tetap memakai
 *  tinggi penuh, tidak dikerdilkan oleh kotak berasio lebar. */
const GRID_MEDIA_H = "h-60";

/**
 * Kartu berita.
 *
 * `feature` = berita terbaru di puncak halaman. Susunannya mengikuti
 * `cover_layout` yang dipilih admin:
 *   - landscape → gambar melebar, judul & ringkasan di bawahnya
 *   - portrait  → gambar tinggi di satu sisi, teks di sisi lain, sehingga
 *                 tidak ada bidang kosong di kiri-kanan gambar sempit
 */
export default function NewsCard({
  item,
  feature = false,
}: {
  item: NewsItem;
  feature?: boolean;
}) {
  const portrait = feature && Boolean(item.cover_url) && item.cover_layout === "portrait";

  /* Hanya admin yang bisa melihat ini — endpoint publik menyaring
     draft/arsip, jadi penanda ini aman ditampilkan. */
  const badge = item.status !== "published" && (
    <span className="absolute left-3 top-3 rounded bg-obsidian px-2 py-1 font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-paper-white">
      {item.status}
    </span>
  );

  const cover = item.cover_url ? (
    <div
      className={`${FRAME} ${
        feature
          ? // w-fit: bingkai menyusut mengikuti gambar, jadi tidak pernah ada
            // bidang kosong di samping — berapa pun rasio yang diunggah.
            "mx-auto w-fit max-w-full"
          : `flex ${GRID_MEDIA_H} items-center justify-center`
      } ${portrait ? "md:mx-0 md:max-w-[52%] md:shrink-0" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={encodeURI(item.cover_url)}
        alt={item.cover_alt ?? item.title}
        loading={feature ? "eager" : "lazy"}
        className={`${ZOOM} object-contain ${
          feature
            ? // 60vh di HP: cover 9:16 selebar layar akan setinggi ~608px dan
              // mendorong judulnya keluar layar. Dibatasi tinggi, bukan lebar.
              "block max-h-[60vh] w-auto max-w-full md:max-h-[70vh]"
            : "max-h-full max-w-full"
        }`}
      />
      {badge}
    </div>
  ) : (
    <div
      className={`${FRAME} grid place-items-center ${
        feature ? "aspect-[16/9] w-full" : GRID_MEDIA_H
      }`}
    >
      <span className="font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian/25">
        Istana Dieng
      </span>
      {badge}
    </div>
  );

  const text = (
    <>
      <span className="block font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
        {item.category} · {newsDate(item)}
      </span>
      <h3
        className={`mt-2 font-display font-bold leading-tight tracking-tight text-obsidian decoration-obsidian/30 underline-offset-4 group-hover:underline group-focus-visible:underline ${
          feature ? "text-3xl sm:text-4xl" : "text-xl"
        }`}
      >
        {item.title}
      </h3>
      <p
        className={`mt-3 font-display leading-relaxed text-graphite ${
          feature ? "text-base line-clamp-3" : "text-sm line-clamp-2"
        } ${feature && !portrait ? "max-w-2xl" : ""}`}
      >
        {newsExcerpt(item, feature ? 220 : 150)}
      </p>
    </>
  );

  if (portrait) {
    return (
      <Link href={`/berita/${item.slug}`} className="group block outline-none">
        {/* Kolom teks dibatasi max-w-xl supaya di laptop pendek (70vh kecil →
            gambar kurus) pasangannya tidak jadi timpang; keduanya lalu
            ditaruh di tengah. */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-center md:gap-14">
          {cover}
          <div className="md:max-w-xl md:flex-1">{text}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/berita/${item.slug}`} className="group block outline-none">
      {cover}
      <div className={feature ? "mt-6" : "mt-4"}>{text}</div>
    </Link>
  );
}
