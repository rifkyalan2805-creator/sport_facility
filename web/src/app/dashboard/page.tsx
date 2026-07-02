"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/lib/auth-context";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
        Dashboard
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Halo, {user?.full_name}
      </h1>
      <div className="mt-8 rounded-2xl border border-ink-900/10 p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-400">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Telepon</dt>
            <dd className="font-medium">{user?.phone}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Role</dt>
            <dd className="font-medium capitalize">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Email terverifikasi</dt>
            <dd className="font-medium">{user?.email_verified ? "Ya" : "Belum"}</dd>
          </div>
        </dl>
      </div>
      <button
        onClick={onLogout}
        className="mt-6 cursor-pointer rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-ink-900/5"
      >
        Keluar
      </button>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
