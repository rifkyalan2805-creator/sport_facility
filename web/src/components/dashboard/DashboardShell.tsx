"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PageNav from "@/components/PageNav";
import { LogoEmblem } from "@/components/brand/Logo";
import RequireAuth from "@/components/auth/RequireAuth";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/lib/auth-context";
import { displayName } from "@/lib/user";

interface NavItem {
  href: string;
  label: string;
  /** true = hanya aktif pada path persis (dipakai untuk /dashboard). */
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Ringkasan", exact: true },
  { href: "/dashboard/membership", label: "Membership Kolam" },
  { href: "/dashboard/abonemen", label: "Abonemen Tenis" },
  { href: "/dashboard/tenis", label: "Insidentil Tenis" },
  { href: "/dashboard/aktivitas", label: "Aktivitas Lain" },
  { href: "/dashboard/profil", label: "Profil" },
];

function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const nama = displayName(user);

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-ink-900/[0.02]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row">
        <aside className="md:w-60 md:shrink-0">
          <div className="flex items-center justify-between md:block">
            <Link href="/" className="flex items-center gap-2">
              <LogoEmblem className="h-8 w-8" />
              <span className="text-sm font-semibold leading-tight tracking-tight text-ink-900">
                ISTANA DIENG
                <span className="block text-[10px] font-medium uppercase tracking-wider text-ink-400">
                  Club House
                </span>
              </span>
            </Link>
          </div>

          <PageNav variant="cta" className="mt-4" />

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-ink-900/10 bg-white p-3">
            <Avatar name={nama} photoUrl={user?.photo_url} className="h-11 w-11" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{nama}</p>
              <p className="truncate text-xs text-ink-400">{user?.email}</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
                    active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-900/5"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <Link
              href="/admin"
              className="mt-4 block rounded-xl border border-neon-purple/30 bg-neon-purple/[0.04] px-4 py-2.5 text-sm font-semibold text-neon-purple outline-none transition-colors hover:border-neon-purple/60 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
            >
              Panel Admin →
            </Link>
          )}

          <div className="mt-8 hidden border-t border-ink-900/10 pt-4 md:block">
            <button
              onClick={onLogout}
              className="text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600"
            >
              Keluar
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

/**
 * Kerangka dashboard pengunjung: sidebar menu (desktop) / tab gulir (mobile).
 * Gate login dipasang di sini, jadi tiap halaman anak tidak perlu membungkus
 * dirinya sendiri dengan RequireAuth.
 */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <ShellFrame>{children}</ShellFrame>
    </RequireAuth>
  );
}
