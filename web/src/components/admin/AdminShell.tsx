"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import RequireRole from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/transaksi", label: "Transaksi" },
  { href: "/admin/abonemen", label: "Registrasi Abonemen" },
  { href: "/admin/courts", label: "Lapangan" },
  { href: "/admin/pool", label: "Kolam" },
  { href: "/admin/pricing", label: "Harga" },
  { href: "/admin/membership", label: "Membership" },
  { href: "/admin/promo", label: "Promo" },
  { href: "/admin/cms", label: "Konten" },
  { href: "/admin/settings", label: "Pengaturan" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <RequireRole>
      <div className="min-h-screen bg-ink-900/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:flex-row">
          {/* Sidebar */}
          <aside className="md:w-60 md:shrink-0">
            <div className="flex items-center justify-between md:block">
              <Link href="/" className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-md bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue" />
                <span className="text-base font-semibold tracking-tight text-ink-900">SportHub</span>
              </Link>
              <span className="mt-1 hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-400 md:block">
                Admin
              </span>
            </div>

            <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
              {NAV.map((n) => {
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
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
