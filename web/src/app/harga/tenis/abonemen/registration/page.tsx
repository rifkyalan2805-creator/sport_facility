"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import {
  useAbonemenPackages,
  useMyAbonemenRegistrations,
  useCreateAbonemenRegistration,
  type AbonemenRegistration,
} from "@/lib/queries";
import { formatRupiah, formatDateID } from "@/lib/format";
import { getErrorMessage } from "@/lib/error";

const STATUS: Record<AbonemenRegistration["status"], { label: string; cls: string }> = {
  pending: { label: "Menunggu Persetujuan", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Disetujui", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Ditolak", cls: "bg-red-100 text-red-600" },
  cancelled: { label: "Dibatalkan", cls: "bg-ink-900/10 text-ink-700" },
};

const inputCls =
  "mt-1 w-full rounded-xl border border-ink-900/15 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors duration-200 placeholder:text-ink-400 focus:border-neon-purple focus-visible:ring-4 focus-visible:ring-neon-purple/20";

function RegistrationForm() {
  const { user } = useAuth();
  const { data: packages = [], isLoading: pkgLoading } = useAbonemenPackages();
  const { data: registrations = [], isLoading: regLoading } = useMyAbonemenRegistrations();
  const create = useCreateAbonemenRegistration();

  const [packageId, setPackageId] = useState("");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const approved = registrations.find((r) => r.status === "approved");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await create.mutateAsync({
        package_id: packageId,
        full_name: fullName.trim(),
        phone: phone.trim(),
        communication_email: email.trim(),
        notes: notes.trim() || undefined,
      });
      setDone(true);
      setNotes("");
    } catch (err) {
      setError(getErrorMessage(err)); // mis. 409 "sudah punya pengajuan aktif"
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
        <span className="h-1.5 w-1.5 rounded-full bg-neon-purple" />
        Tenis · Abonemen
      </span>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
        Registrasi <span className="text-gradient-neon">Abonemen</span>
      </h1>
      <p className="mt-4 max-w-xl text-ink-500">
        Tarif abonemen tenis (mulai Rp145.000/jam) hanya berlaku untuk anggota
        terdaftar. Ajukan registrasi di bawah — admin akan meninjau, dan info
        tagihan/invoice dikirim ke email yang kamu cantumkan.
      </p>

      {approved && (
        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">
          <p className="font-semibold text-green-700">✓ Registrasi kamu sudah disetujui</p>
          <p className="mt-1 text-sm text-green-700/80">
            Tarif abonemen sudah bisa dipakai saat booking lapangan tenis.
          </p>
        </div>
      )}

      {/* ---- Riwayat pengajuan ---- */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink-900">Pengajuan Saya</h2>
        {regLoading ? (
          <div className="mt-4 h-20 animate-pulse rounded-2xl bg-ink-900/5" />
        ) : registrations.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">Belum ada pengajuan.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {registrations.map((r) => {
              const s = STATUS[r.status] ?? STATUS.pending;
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-2 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-900">
                        {r.abonemen_packages?.name ?? "Paket abonemen"}
                      </p>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                      Diajukan {formatDateID(r.created_at)} · {r.communication_email}
                    </p>
                  </div>
                  {r.abonemen_packages && (
                    <p className="font-semibold text-ink-900">
                      {formatRupiah(r.abonemen_packages.price)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---- Form ---- */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-ink-900">Ajukan Registrasi Baru</h2>

        {done ? (
          <div className="mt-4 rounded-2xl border border-ink-900/10 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              ✓
            </div>
            <p className="mt-3 text-lg font-semibold text-ink-900">Pengajuan terkirim</p>
            <p className="mt-1 text-sm text-ink-500">
              Status <b>Menunggu Persetujuan</b>. Kami akan menghubungi kamu lewat{" "}
              <span className="font-medium text-ink-700">{email}</span>.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="mt-5 rounded-full border border-ink-900/15 px-6 py-2.5 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
            >
              Ajukan lagi
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-5 rounded-2xl border border-ink-900/10 p-6">
            <div>
              <label htmlFor="package" className="text-sm font-medium text-ink-700">
                Layanan abonemen
              </label>
              <select
                id="package"
                required
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                disabled={pkgLoading}
                className={inputCls}
              >
                <option value="">{pkgLoading ? "Memuat paket…" : "— Pilih paket —"}</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatRupiah(p.price)} ({p.sessions_per_week}x/minggu ·{" "}
                    {p.duration_weeks} minggu)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-ink-700">
                  Nama lengkap
                </label>
                <input
                  id="fullName"
                  required
                  minLength={2}
                  maxLength={150}
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputCls}
                  placeholder="Nama sesuai identitas"
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-ink-700">
                  Nomor HP
                </label>
                <input
                  id="phone"
                  required
                  autoComplete="tel"
                  pattern="[0-9+()\-\s]{8,20}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink-700">
                Akun Google (email komunikasi)
              </label>
              <input
                id="email"
                type="email"
                required
                maxLength={255}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="nama@gmail.com"
              />
              <p className="mt-1.5 text-xs text-ink-400">
                Dipakai untuk mengirim feedback, invoice, dan tagihan.
              </p>
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium text-ink-700">
                Catatan <span className="text-ink-400">(opsional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                maxLength={1000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputCls}
                placeholder="Preferensi jadwal, dll."
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={create.isPending || !packageId}
                className={`inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
                  create.isPending || !packageId
                    ? "cursor-not-allowed bg-ink-900/10 text-ink-400"
                    : "bg-ink-900 text-white hover:bg-neon-pink"
                }`}
              >
                {create.isPending ? "Mengirim…" : "Ajukan Registrasi"}
              </button>
              <Link
                href="/harga/tenis"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
              >
                Kembali
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default function AbonemenRegistrationPage() {
  return (
    <>
      <Navbar />
      <RequireAuth>
        <RegistrationForm />
      </RequireAuth>
      <Footer />
    </>
  );
}
