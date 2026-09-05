import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Tombol sistem broadsheet (DESIGN.md).
 *
 * Aturan yang ditegakkan di sini, sekali untuk seluruh homepage:
 *  - `gradient` adalah SATU-SATUNYA isian kromatis di sistem ini. Pakai paling
 *    banyak satu per tampilan; selebihnya `obsidian` atau `ghost`.
 *  - Radius selalu 8px (rounded-lg). Tidak ada bentuk pill.
 *  - Tanpa drop-shadow: kedalaman berasal dari kontras nilai, bukan blur.
 *  - Teks memakai condensed 600 uppercase dengan tracking positif.
 */

type Variant = "gradient" | "obsidian" | "ghost" | "paper";

const VARIANTS: Record<Variant, string> = {
  gradient: "bg-speedrun text-paper-white hover:opacity-90",
  obsidian: "bg-obsidian text-paper-white hover:bg-obsidian/85",
  // Untuk latar gelap: isian putih, teks hitam.
  paper: "bg-paper-white text-obsidian hover:bg-paper-white/90",
  ghost:
    "border border-obsidian/15 text-obsidian hover:border-obsidian/40 hover:bg-obsidian/[0.03]",
};

interface Props {
  href: string;
  children: ReactNode;
  variant?: Variant;
  /** `lg` memberi padding horizontal 56px sesuai anjuran DESIGN.md. */
  size?: "md" | "lg";
  className?: string;
}

export default function Button({
  href,
  children,
  variant = "obsidian",
  size = "md",
  className = "",
}: Props) {
  const pad = size === "lg" ? "px-14 py-3.5" : "px-6 py-2.5";
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg font-condensed text-xs font-semibold uppercase tracking-eyebrow outline-none transition-[opacity,background-color,border-color] duration-200 focus-visible:ring-4 focus-visible:ring-obsidian/20 sm:text-sm ${VARIANTS[variant]} ${pad} ${className}`}
    >
      {children}
    </Link>
  );
}

/**
 * Label eyebrow — condensed 600 uppercase, tracking +0.06em.
 * Selalu mendahului heading; berperan sbg ketukan tipografis pembuka.
 */
export function Eyebrow({
  children,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  tone?: "dark" | "light" | "gradient";
  className?: string;
}) {
  const color =
    tone === "light"
      ? "text-paper-white/70"
      : tone === "gradient"
        ? "text-gradient-speedrun"
        : "text-graphite";
  return (
    <span
      className={`block font-condensed text-xs font-semibold uppercase tracking-eyebrow ${color} ${className}`}
    >
      {children}
    </span>
  );
}
