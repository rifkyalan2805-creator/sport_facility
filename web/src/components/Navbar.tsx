"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/brand/Logo";
import Button from "@/components/brand/Button";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/lib/auth-context";
import { displayName } from "@/lib/user";

/** Menu utama — kelima rute di bawah sudah punya halamannya masing-masing. */
const LINKS = [
  { label: "Home", href: "/" },
  { label: "Fasilitas", href: "/fasilitas" },
  { label: "Berita", href: "/berita" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Kontak", href: "/kontak" },
];

/** Jeda antar huruf pada efek gulir — makin besar, makin terasa berurutan. */
const ROLL_STEP_MS = 28;

/** Lewat titik ini bar mulai menyembunyikan diri saat digulir turun. */
const HIDE_AFTER_PX = 96;

/**
 * Teks yang menggulir per huruf saat hover.
 *
 * Tiap huruf ditumpuk dua salinan di dalam kotak setinggi satu baris
 * (overflow hidden); saat hover kolomnya digeser -50% sehingga salinan lama
 * keluar ke atas dan salinan kedua masuk dari bawah. Delay bertingkat per
 * huruf membuat gulirannya berurutan, bukan serentak.
 *
 * Teks utuh tetap dibaca screen reader lewat `sr-only`, sementara deretan
 * hurufnya `aria-hidden` supaya tidak dieja satu per satu.
 */
function RollText({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex">
        {Array.from(text).map((raw, i) => {
          // Spasi biasa di elemen block diciutkan browser sampai kotaknya nol
          // lebar — "Tentang Kami" jadi menyatu. Karena itu dipakai nbsp.
          const ch = raw === " " ? " " : raw;
          return (
            <span key={i} className="block h-[1.4em] overflow-hidden">
              <span
                className="block transition-transform duration-[550ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2 motion-reduce:transition-none"
                style={{ transitionDelay: `${i * ROLL_STEP_MS}ms` }}
              >
                <span className="block leading-[1.4em]">{ch}</span>
                <span className="block leading-[1.4em]">{ch}</span>
              </span>
            </span>
          );
        })}
      </span>
    </>
  );
}

/** Garis bawah dibuat dari ::after; hover (ungu) selalu menang atas aktif (kuning). */
const LINK_BASE =
  "group relative block select-none whitespace-nowrap rounded-full px-4 py-3 font-display text-[15px] font-medium tracking-tight text-paper-white outline-none transition-colors duration-300 hover:text-nav-hover focus-visible:text-nav-hover sm:px-6 sm:text-[17px] " +
  "after:pointer-events-none after:absolute after:bottom-1.5 after:left-4 after:right-4 after:h-0.5 after:origin-left after:rounded-full after:content-[''] after:transition-transform after:duration-[350ms] after:ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:after:transition-none sm:after:left-6 sm:after:right-6 " +
  "hover:after:scale-x-100 hover:after:bg-nav-hover focus-visible:after:scale-x-100 focus-visible:after:bg-nav-hover";

/**
 * Bar navigasi tetap (fixed), selebar layar penuh.
 *
 * `tone` kini menentukan titik awal latarnya, bukan warna teks:
 *  - `light` (beranda) — mulai transparan di atas hero foto gelap, lalu
 *    berisi `nav-ink` begitu halaman digulir, dan kembali transparan saat
 *    pengunjung balik ke puncak halaman.
 *  - `dark` (bawaan, 11 halaman lain) — bar solid sejak awal.
 *
 * Di kedua keadaan latarnya gelap, jadi teks & logo selalu versi terang.
 * Perilaku sembunyi/muncul sama di semua halaman: gulir turun menyembunyikan
 * bar, gulir naik memunculkannya kembali.
 */
export default function Navbar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  const startsTransparent = tone === "light";

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Ambang 4px meredam getaran scroll halus (trackpad) yang bikin bar
      // berkedip antara sembunyi dan muncul.
      if (y > last + 4 && y > HIDE_AFTER_PX) setHidden(true);
      else if (y < last - 4) setHidden(false);
      last = y;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Panel mobile ditutup setiap kali rute berganti.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function onLogout() {
    await logout();
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Panel terbuka memaksa latar solid supaya isinya terbaca di atas hero.
  const solid = !startsTransparent || scrolled || open;
  const ghost =
    "font-display text-sm font-semibold text-paper-white/75 outline-none transition-colors duration-200 hover:text-paper-white focus-visible:underline";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color] duration-300 ease-out motion-reduce:transition-none ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${solid ? "bg-nav-ink" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-6 px-6">
        <Logo tone="light" size="sm" />

        <nav className="hidden items-center lg:flex" aria-label="Menu utama">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`${LINK_BASE} ${
                  active
                    ? "after:scale-x-100 after:bg-nav-active"
                    : "after:scale-x-0 after:bg-nav-hover"
                }`}
              >
                <RollText text={l.label} />
              </Link>
            );
          })}
        </nav>

        {/* Aksi — bergantung status auth (disembunyikan saat masih loading) */}
        <div className="flex items-center gap-4">
          {!loading &&
            (user ? (
              <>
                {(user.role === "staff" ||
                  user.role === "admin" ||
                  user.role === "superadmin") && (
                  <Link href="/admin" className={`hidden sm:inline-flex ${ghost}`}>
                    Panel
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className={`hidden items-center gap-2.5 sm:inline-flex ${ghost}`}
                >
                  <Avatar
                    name={displayName(user)}
                    photoUrl={user.photo_url}
                    tone="dark"
                    className="h-8 w-8 ring-1 ring-paper-white/25"
                  />
                  {displayName(user)}
                </Link>
                <button
                  onClick={onLogout}
                  className="rounded-lg border border-paper-white/25 px-6 py-2.5 font-condensed text-xs font-semibold uppercase tracking-eyebrow text-paper-white outline-none transition-colors duration-200 hover:border-paper-white/60 focus-visible:ring-4 focus-visible:ring-paper-white/20 sm:text-sm"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`hidden sm:inline-flex ${ghost}`}>
                  Masuk
                </Link>
                {/* Sengaja BUKAN gradient: di beranda tombol ini satu viewport
                    dengan CTA hero, dan gradient hanya boleh satu per tampilan. */}
                <Button href="/register" variant="paper">
                  Daftar
                </Button>
              </>
            ))}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-paper-white outline-none transition-colors duration-200 hover:bg-paper-white/10 focus-visible:ring-4 focus-visible:ring-paper-white/20 lg:hidden"
          >
            {/* Dua garis yang menyilang jadi X — tanpa ikon eksternal. */}
            <span className="relative block h-4 w-6" aria-hidden>
              <span
                className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0.5"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Panel mobile — hover tidak ada di layar sentuh, jadi di sini penanda
          halaman aktif dipindah ke garis kiri, bukan efek gulir per huruf. */}
      {open && (
        <div
          id="nav-mobile"
          className="border-t border-paper-white/10 bg-nav-ink lg:hidden"
        >
          <nav
            className="mx-auto max-w-[1200px] px-6 py-4"
            aria-label="Menu utama (mobile)"
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={`block border-l-2 py-3 pl-4 font-display text-base font-medium tracking-tight outline-none transition-colors duration-200 focus-visible:text-nav-hover ${
                        active
                          ? "border-nav-active text-paper-white"
                          : "border-transparent text-paper-white/70 hover:border-nav-hover hover:text-nav-hover"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Hanya di bawah sm — dari sm ke atas, link ini sudah tampil di bar. */}
            {!loading && (
              <div className="mt-3 flex flex-col border-t border-paper-white/10 pt-3 sm:hidden">
                {user ? (
                  <>
                    {(user.role === "staff" ||
                      user.role === "admin" ||
                      user.role === "superadmin") && (
                      <Link href="/admin" className={`py-2 pl-4 ${ghost}`}>
                        Panel
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className={`flex items-center gap-2.5 py-2 pl-4 ${ghost}`}
                    >
                      <Avatar
                        name={displayName(user)}
                        photoUrl={user.photo_url}
                        tone="dark"
                        className="h-7 w-7 ring-1 ring-paper-white/25"
                      />
                      Akun saya
                    </Link>
                  </>
                ) : (
                  <Link href="/login" className={`py-2 pl-4 ${ghost}`}>
                    Masuk
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
