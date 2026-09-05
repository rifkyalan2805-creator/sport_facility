"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PageNav from "@/components/PageNav";
import { LogoEmblem } from "@/components/brand/Logo";
import RequireRole from "@/components/auth/RequireRole";
import {
  ADMIN_TIER_ROLES,
  canAccess,
  isAdminTier,
  landingFor,
  navFor,
} from "@/lib/admin-access";
import { useAuth } from "@/lib/auth-context";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const nav = navFor(user?.role);

  // Gate per-halaman terpusat: admin-tier yang membuka halaman di luar izin
  // role-nya dialihkan ke landing role tsb (reception → /admin/transaksi).
  const blocked = !!user && isAdminTier(user.role) && !canAccess(user.role, pathname);

  useEffect(() => {
    if (loading || !user || !isAdminTier(user.role)) return;
    if (!canAccess(user.role, pathname)) {
      router.replace(landingFor(user.role));
    }
  }, [loading, user, pathname, router]);

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <RequireRole roles={[...ADMIN_TIER_ROLES]}>
      <div className="min-h-screen bg-ink-900/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:flex-row">
          {/* Sidebar */}
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
              <span className="mt-1 hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-400 md:block">
                Admin
              </span>
            </div>

            <PageNav variant="cta" className="mt-4" />

            <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
              {nav.map((n) => {
                const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
                      active ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-900/5"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 hidden border-t border-ink-900/10 pt-4 md:block">
              <p className="text-sm font-medium text-ink-700">{user?.full_name}</p>
              <p className="text-xs text-ink-400">{user?.email}</p>
              <button
                onClick={onLogout}
                className="mt-3 text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600"
              >
                Keluar
              </button>
            </div>
          </aside>

          {/* Konten */}
          <main className="min-w-0 flex-1">
            {blocked ? (
              <div className="grid min-h-[40vh] place-items-center text-ink-400">
                Mengalihkan…
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
