"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const links = [
  { label: "Fasilitas", href: "#fasilitas" },
  { label: "Membership", href: "#" },
  { label: "Event", href: "#" },
  { label: "Tentang", href: "#" },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 flex h-14 max-w-6xl items-center justify-between gap-6 rounded-2xl border border-ink-900/10 bg-white/70 px-5 backdrop-blur-xl md:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue" />
          <span className="text-base font-semibold tracking-tight text-ink-900">
            SportHub
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-ink-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions — bergantung status auth (disembunyikan saat masih loading) */}
        <div className="flex items-center gap-2">
          {!loading &&
            (user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors duration-200 hover:text-ink-900 sm:inline-flex"
                >
                  Halo, {user.full_name.split(" ")[0]}
                </Link>
                <button
                  onClick={onLogout}
                  className="cursor-pointer rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-700"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-ink-700 transition-colors duration-200 hover:text-ink-900 sm:inline-flex"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="cursor-pointer rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-700"
                >
                  Daftar
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
