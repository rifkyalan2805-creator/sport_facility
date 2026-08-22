import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        // Sistem desain broadsheet (homepage). messinaSans / messinaSansCondensed
        // berlisensi komersial → dipakai substitusi resmi dari DESIGN.md.
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        condensed: ["var(--font-condensed)", "Inter Tight", "system-ui", "sans-serif"],
      },
      colors: {
        // Tinta (Apple-style: near-black, bukan hitam pekat)
        ink: {
          900: "#0a0a0b",
          700: "#1d1d1f",
          500: "#3a3a3c",
          400: "#6e6e73",
          300: "#86868b",
        },
        // Neon aksen — pink / purple / blue
        neon: {
          pink: "#ff2d92",
          purple: "#8b5cf6",
          blue: "#3b82f6",
        },
        // ---- Token DESIGN.md (broadsheit monokrom) ----
        "cloud-gray": "#e5e7eb", // kanvas halaman & garis rambut
        obsidian: "#000000", // teks utama, tombol sekunder, footer
        "paper-white": "#ffffff", // permukaan kartu
        "sand-beige": "#e2dfd8", // wash hangat, permukaan alternatif
        graphite: "#5e5d5c", // teks sekunder
        // ---- Aksen navbar ----
        // Pengecualian yang disengaja terhadap aturan monokrom DESIGN.md:
        // dipakai TERBATAS di bar navigasi, tidak di tempat lain.
        "nav-ink": "#141414", // isian bar saat solid (near-black, bukan #000)
        "nav-hover": "#8833FF", // teks + garis saat hover
        "nav-active": "#FACC15", // garis penanda halaman yang sedang dibuka
      },
      backgroundImage: {
        // SATU-SATUNYA isian kromatis di sistem ini — hanya untuk aksi utama.
        speedrun:
          "linear-gradient(90deg, #00c6c6 0%, #00b5f4 20%, #00a1ff 40%, #398cff 50%, #757aff 60%, #906dff 75%, #a162ff 100%)",
      },
      letterSpacing: {
        // Tracking negatif agresif pada ukuran display = ciri khas sistem ini.
        display: "-0.05em",
        hero: "-0.074em",
        eyebrow: "0.06em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
