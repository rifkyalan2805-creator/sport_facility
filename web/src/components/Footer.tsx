import Link from "next/link";

const groups = [
  {
    title: "Fasilitas",
    links: ["Padel", "Tenis", "Kolam Renang", "Event"],
  },
  {
    title: "Perusahaan",
    links: ["Tentang Kami", "Membership", "Komunitas", "Karier"],
  },
  {
    title: "Bantuan",
    links: ["FAQ", "Kontak", "Syarat & Ketentuan", "Privasi"],
  },
];

const socials = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.06.37-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.06-.42-2.23C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.37 2.23-.42C8.42 2.2 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5 0-4.74.07-.9.04-1.38.2-1.7.32-.43.17-.74.37-1.06.7-.32.32-.52.63-.7 1.06-.12.32-.28.8-.32 1.7C3.4 8.5 3.4 8.85 3.4 12s0 3.5.07 4.74c.04.9.2 1.38.32 1.7.17.43.37.74.7 1.06.32.32.63.52 1.06.7.32.12.8.28 1.7.32 1.24.07 1.6.07 4.74.07s3.5 0 4.74-.07c.9-.04 1.38-.2 1.7-.32.43-.17.74-.37 1.06-.7.32-.32.52-.63.7-1.06.12-.32.28-.8.32-1.7.07-1.24.07-1.6.07-4.74s0-3.5-.07-4.74c-.04-.9-.2-1.38-.32-1.7a2.9 2.9 0 0 0-.7-1.06 2.9 2.9 0 0 0-1.06-.7c-.32-.12-.8-.28-1.7-.32C15.5 4 15.15 4 12 4zm0 3.06A4.94 4.94 0 1 1 12 16.94 4.94 4.94 0 0 1 12 7.06zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28zm5.13-1.15a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z",
  },
  {
    label: "X",
    path: "M17.53 3H20.5l-6.49 7.42L21.75 21h-5.98l-4.68-6.12L5.7 21H2.73l6.94-7.93L2.5 3h6.13l4.23 5.6L17.53 3zm-1.05 16.2h1.65L7.6 4.7H5.83l10.65 14.5z",
  },
  {
    label: "YouTube",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.4.53A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.9.53 9.4.53 9.4.53s7.5 0 9.4-.53a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* CTA band */}
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-16 md:grid-cols-2 md:py-20">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Siap jadi bagian dari{" "}
            <span className="text-gradient-neon">komunitas kami?</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link
              href="#"
              className="cursor-pointer rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue px-7 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-neon-purple/25 transition-transform duration-200 hover:scale-[1.03]"
            >
              Gabung Sekarang
            </Link>
            <Link
              href="#"
              className="cursor-pointer rounded-full border border-white/20 px-7 py-3.5 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[2fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-md bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue" />
            <span className="text-base font-semibold tracking-tight">SportHub</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
            Ekosistem olahraga tempat kompetisi, persahabatan, dan gaya hidup sehat
            bertemu—lapangan, kolam, event, dan komunitas dalam satu tempat.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {socials.map((s) => (
              <Link
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d={s.path} />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Link groups */}
        {groups.map((g) => (
          <nav key={g.title}>
            <h3 className="text-sm font-semibold text-white">{g.title}</h3>
            <ul className="mt-4 space-y-3">
              {g.links.map((l) => (
                <li key={l}>
                  <Link
                    href="#"
                    className="text-sm text-white/50 transition-colors duration-200 hover:text-white"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-white/40 sm:flex-row">
          <span>© 2026 SportHub. Semua hak dilindungi.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors duration-200 hover:text-white">
              Privasi
            </Link>
            <Link href="#" className="transition-colors duration-200 hover:text-white">
              Syarat
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
