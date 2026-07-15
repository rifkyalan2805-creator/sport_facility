"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageNav from "@/components/PageNav";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/error";

const inputCls =
  "mt-1 w-full rounded-xl border border-ink-900/15 px-4 py-3 text-sm outline-none transition-colors focus:border-neon-purple";

function RegisterForm() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(redirect);
  }, [loading, user, redirect, router]);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      router.push(redirect);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mendaftar. Periksa kembali data Anda."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center bg-white px-6 py-12">
      <PageNav variant="cta" className="absolute left-6 top-6" />
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue" />
          <span className="text-base font-semibold tracking-tight">SportHub</span>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Daftar</h1>
        <p className="mt-2 text-sm text-ink-400">Gabung ke komunitas kami.</p>

        <label className="mt-6 block text-sm font-medium">
          Nama Lengkap
          <input
            required
            minLength={2}
            autoComplete="name"
            value={form.full_name}
            onChange={set("full_name")}
            className={inputCls}
            placeholder="Nama lengkap"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={set("email")}
            className={inputCls}
            placeholder="nama@email.com"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Nomor Telepon
          <input
            required
            autoComplete="tel"
            inputMode="tel"
            pattern="[0-9+()\-\s]{8,20}"
            title="8–20 digit, boleh + ( ) -"
            value={form.phone}
            onChange={set("phone")}
            className={inputCls}
            placeholder="08xxxxxxxxxx"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            className={inputCls}
            placeholder="Minimal 8 karakter"
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
          {submitting ? "Memproses…" : "Buat Akun"}
        </button>

        <p className="mt-6 text-center text-sm text-ink-400">
          Sudah punya akun?{" "}
          <Link
            href={`/login${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-medium text-ink-900 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center text-ink-400">
          Memuat…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
