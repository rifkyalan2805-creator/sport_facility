"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageNav from "@/components/PageNav";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/error";

const inputCls =
  "mt-1 w-full rounded-xl border border-ink-900/15 px-4 py-3 text-sm outline-none transition-colors focus:border-neon-purple";

const isAdminRole = (role?: string) => role === "admin" || role === "superadmin";

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const explicitRedirect = params.get("redirect");
  const redirect = explicitRedirect || "/dashboard"; // dipakai link "Daftar"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Tujuan: hormati ?redirect=; jika tidak ada, admin → /admin, lainnya → /dashboard.
  const destFor = (role?: string) =>
    explicitRedirect || (isAdminRole(role) ? "/admin" : "/dashboard");

  // B: kalau sudah login, jangan tampilkan form — arahkan ke tujuan.
  useEffect(() => {
    if (!loading && user) router.replace(destFor(user.role));
  }, [loading, user, explicitRedirect, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const u = await login(email, password);
      router.push(destFor(u.role)); // C: admin → /admin, lainnya → /dashboard
    } catch (err) {
      setError(getErrorMessage(err, "Gagal masuk. Coba lagi.")); // D: pesan spesifik
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center bg-white px-6">
      <PageNav variant="cta" className="absolute left-6 top-6" />
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue" />
          <span className="text-base font-semibold tracking-tight">SportHub</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Masuk</h1>
        <p className="mt-2 text-sm text-ink-400">Selamat datang kembali.</p>

        <label className="mt-6 block text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="nama@email.com"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full cursor-pointer rounded-full bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {submitting ? "Memproses…" : "Masuk"}
        </button>

        <p className="mt-6 text-center text-sm text-ink-400">
          Belum punya akun?{" "}
          <Link
            href={`/register${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-medium text-ink-900 hover:underline"
          >
            Daftar
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-ink-400">
          Memuat…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
