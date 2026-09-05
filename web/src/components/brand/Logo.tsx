import Link from "next/link";

/**
 * Lockup merek ISTANA DIENG CLUB HOUSE.
 *
 * Mengikuti DESIGN.md: emblem berperan sebagai cap keaslian berukuran kecil,
 * sementara NAMA dirender sebagai wordmark tipografi — display 900 dengan
 * tracking negatif ketat pada "ISTANA DIENG", disusul condensed 600 uppercase
 * dengan tracking positif pada "CLUB HOUSE". Kontras tracking negatif→positif
 * itulah ritme khas sistem ini.
 */

const LOGO_SRC = "/images/sport club/swimming pools/logo_transparent.png";

/**
 * Emblem hanya mengisi ~46% tinggi PNG-nya (sisanya margin transparan), jadi
 * object-contain apa adanya membuatnya tampak mungil. Kita crop optis: kotak
 * overflow-hidden + skala ~2.1 pada gambar yang sudah center secara horizontal
 * maupun vertikal. Menghindari ketergantungan pipeline pemrosesan gambar.
 */
export function LogoEmblem({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={encodeURI(LOGO_SRC)}
        alt=""
        aria-hidden
        className="h-full w-full scale-[2.1] object-contain"
      />
    </span>
  );
}

type Tone = "dark" | "light";

interface Props {
  /** `dark` = teks hitam (kanvas terang) · `light` = teks putih (hero/footer gelap). */
  tone?: Tone;
  /** Ukuran lockup. `sm` untuk navbar, `lg` untuk hero & footer. */
  size?: "sm" | "lg";
  /** Bungkus dengan Link ke beranda. */
  href?: string;
  className?: string;
}

export default function Logo({
  tone = "dark",
  size = "sm",
  href = "/",
  className = "",
}: Props) {
  const primary = tone === "light" ? "text-paper-white" : "text-obsidian";
  const secondary = tone === "light" ? "text-paper-white/70" : "text-graphite";

  const emblem = size === "lg" ? "h-14 w-14" : "h-9 w-9";
  const nameSize = size === "lg" ? "text-xl sm:text-2xl" : "text-[15px]";
  const subSize = size === "lg" ? "text-[11px]" : "text-[9px]";

  const lockup = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoEmblem className={emblem} />
      <span className="flex min-w-0 flex-col justify-center">
        <span
          className={`font-display font-black leading-none tracking-display ${primary} ${nameSize}`}
        >
          ISTANA DIENG
        </span>
        <span
          className={`font-condensed font-semibold uppercase leading-none tracking-eyebrow ${secondary} ${subSize} mt-1`}
        >
          Club House
        </span>
      </span>
    </span>
  );

  if (!href) return lockup;

  return (
    <Link href={href} aria-label="ISTANA DIENG CLUB HOUSE — beranda">
      {lockup}
    </Link>
  );
}
