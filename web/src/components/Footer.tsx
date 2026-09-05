import Link from "next/link";
import Logo from "@/components/brand/Logo";
import Button from "@/components/brand/Button";
import { KANAL } from "@/lib/contact";
import { IG_PATH, WA_PATH } from "@/components/contact/icons";

/** Alamat kanal diambil dari `lib/contact.ts` supaya tidak berbeda dengan /kontak. */
const hrefKanal = (id: "whatsapp" | "instagram") =>
  KANAL.find((k) => k.id === id)?.href ?? "#";

const groups = [
  {
    title: "Fasilitas",
    links: [
      { label: "Lapangan Padel", href: "/harga/padel" },
      { label: "Lapangan Tenis", href: "/harga/tenis" },
      { label: "Kolam Renang", href: "/harga/pool" },
      { label: "Agenda & Turnamen", href: "/events" },
    ],
  },
  {
    title: "Keanggotaan",
    links: [
      { label: "Membership Kolam", href: "/membership/daftar" },
      { label: "Abonemen Tenis", href: "/harga/tenis/abonemen/registration" },
      { label: "Daftar Akun", href: "/register" },
      { label: "Masuk", href: "/login" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Daftar Harga", href: "/harga" },
      { label: "Kontak", href: "/kontak" },
      { label: "Ketentuan Reservasi", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
      { label: "Kebijakan Privasi", href: "#" },
    ],
  },
];

/**
 * Lambang Instagram & WhatsApp diambil dari `components/contact/icons.tsx`
 * supaya bentuknya persis sama dengan yang dipakai kartu kanal di /kontak.
 *
 * TODO(pemilik): akun YouTube belum terdaftar di `lib/contact.ts`, jadi
 * tautannya masih menggantung sampai alamatnya tersedia.
 */
const YT_PATH =
  "M23.5 6.2a3 3 0 0 0-2.1-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.4.53A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.9.53 9.4.53 9.4.53s7.5 0 9.4-.53a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z";

const socials = [
  { label: "Instagram", path: IG_PATH, href: hrefKanal("instagram"), external: true },
  { label: "WhatsApp", path: WA_PATH, href: hrefKanal("whatsapp"), external: true },
  { label: "YouTube", path: YT_PATH, href: "#", external: false },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian text-paper-white">
      {/* Pita ajakan — satu tombol gradient sebagai satu-satunya warna */}
      <div className="border-b border-paper-white/10">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-20 md:grid-cols-2">
          <h2 className="font-display text-4xl font-black leading-none tracking-display sm:text-5xl">
            Lapangan sudah siap.
            <br />
            Tinggal pilih jamnya.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button href="/register" variant="gradient" size="lg">
              Mulai Reservasi
            </Button>
            <Button
              href="/harga"
              variant="ghost"
              size="lg"
              className="border-paper-white/25 text-paper-white hover:border-paper-white/60 hover:bg-paper-white/5"
            >
              Lihat Harga
            </Button>
          </div>
        </div>
      </div>

      {/* Isi utama */}
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" size="lg" />
          <p className="mt-6 max-w-xs font-display text-sm leading-relaxed text-paper-white/55">
            Klub olahraga terpadu dengan lapangan padel dan tenis berstandar
            kompetisi serta kolam renang yang terawat — dikelola satu tim, dalam
            satu sistem reservasi.
          </p>
          <div className="mt-8 flex items-center gap-3">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                {...(s.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-paper-white/15 text-paper-white/70 outline-none transition-colors duration-200 hover:border-paper-white/45 hover:text-paper-white focus-visible:ring-4 focus-visible:ring-paper-white/20"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d={s.path} />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {groups.map((g) => (
          <nav key={g.title}>
            <h3 className="font-condensed text-xs font-semibold uppercase tracking-eyebrow text-paper-white">
              {g.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="font-display text-sm text-paper-white/55 outline-none transition-colors duration-200 hover:text-paper-white focus-visible:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Baris bawah */}
      <div className="border-t border-paper-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-6 py-6 font-display text-xs text-paper-white/40 sm:flex-row">
          <span>© 2026 ISTANA DIENG CLUB HOUSE. Seluruh hak cipta dilindungi.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors duration-200 hover:text-paper-white">
              Privasi
            </Link>
            <Link href="#" className="transition-colors duration-200 hover:text-paper-white">
              Syarat
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
