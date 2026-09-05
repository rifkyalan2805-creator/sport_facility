"use client";

import { assetUrl } from "@/lib/asset";

/** Inisial dari nama — cadangan saat user belum punya foto profil. */
function initials(name: string): string {
  const kata = name.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "?";
  return (kata[0][0] + (kata[1]?.[0] ?? "")).toUpperCase();
}

// Warna cadangan inisial mengikuti latar tempat avatar dipasang: `light` untuk
// panel putih dashboard, `dark` untuk bar navigasi yang berlatar gelap.
const TONE = {
  light: "bg-ink-900/10 text-ink-600",
  dark: "bg-paper-white/20 text-paper-white",
} as const;

export default function Avatar({
  name,
  photoUrl,
  className = "h-10 w-10",
  tone = "light",
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
  tone?: keyof typeof TONE;
}) {
  // assetUrl meloloskan URL absolut (Supabase) apa adanya dan memberi origin
  // API pada path legacy "/uploads/...".
  const src = assetUrl(photoUrl);

  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-full text-sm font-semibold ${TONE[tone]} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Foto ${name}`} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
