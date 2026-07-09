"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutPanel from "@/components/booking/CheckoutPanel";
import { useAuth } from "@/lib/auth-context";
import {
  useEvent,
  useMyEventRegistrations,
  useRegisterEvent,
} from "@/lib/queries";
import { makeEventRunner } from "@/lib/event-checkout";
import type { CheckoutRunner } from "@/lib/checkout";
import { formatRupiah, formatDateID } from "@/lib/format";
import { getErrorMessage } from "@/lib/error";

const REG_LABEL: Record<string, string> = {
  registered: "Terdaftar (menunggu pembayaran)",
  confirmed: "Terkonfirmasi",
  checked_in: "Sudah check-in",
  waitlisted: "Daftar tunggu",
};

function Detail({ slug }: { slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: event, isLoading, isError } = useEvent(slug);
  const { data: myRegs = [] } = useMyEventRegistrations(Boolean(user));
  const register = useRegisterEvent();
  const runnerRef = useRef<CheckoutRunner | null>(null);

  const [error, setError] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const myReg = useMemo(
    () => (event ? myRegs.find((r) => r.event_id === event.id && r.status !== "cancelled") : undefined),
    [myRegs, event],
  );

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 pt-32 text-ink-400">Memuat…</div>;
  }
  if (isError || !event) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-32 text-center">
        <p className="text-ink-500">Event tidak ditemukan.</p>
        <Link href="/events" className="mt-4 inline-flex text-sm font-medium text-neon-purple hover:text-neon-pink">
          ← Kembali ke daftar event
        </Link>
      </div>
    );
  }

  const free = Number(event.price) <= 0;
  const remaining = Math.max(0, event.quota - event.registered_count);
  const full = remaining === 0;
  const deadlinePassed = Boolean(
    event.registration_deadline && new Date(event.registration_deadline) < new Date(),
  );

  async function onRegisterFree() {
    if (!user) {
      router.push(`/login?redirect=/events/${slug}`);
      return;
    }
    setError("");
    try {
      await register.mutateAsync(event!.id); // event gratis → payment null → confirmed
    } catch (e) {
      setError(getErrorMessage(e)); // 409 sudah terdaftar / 422 kuota / deadline
    }
  }

  function onPay() {
    if (!user) {
      router.push(`/login?redirect=/events/${slug}`);
      return;
    }
    runnerRef.current = makeEventRunner({ eventId: event!.id, qc });
    setCheckoutOpen(true);
  }

  function renderCTA() {
    if (!user)
      return (
        <Link
          href={`/login?redirect=/events/${slug}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-neon-pink"
        >
          Masuk untuk daftar
        </Link>
      );
    if (myReg)
      return (
        <div className="rounded-2xl bg-green-50 p-4 text-center">
          <p className="font-semibold text-green-700">✓ {REG_LABEL[myReg.status] ?? myReg.status}</p>
          <Link href="/dashboard" className="mt-1 inline-flex text-sm font-medium text-green-700/80 hover:underline">
            Lihat di dashboard →
          </Link>
        </div>
      );
    if (deadlinePassed)
      return <button disabled className="w-full cursor-not-allowed rounded-full bg-ink-900/10 px-6 py-3 text-sm font-semibold text-ink-400">Pendaftaran ditutup</button>;
    if (full)
      return <button disabled className="w-full cursor-not-allowed rounded-full bg-ink-900/10 px-6 py-3 text-sm font-semibold text-ink-400">Kuota penuh</button>;
    if (free)
      return (
        <button
          type="button"
          onClick={onRegisterFree}
          disabled={register.isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40 disabled:opacity-50"
        >
          {register.isPending ? "Mendaftarkan…" : "Daftar Gratis"}
        </button>
      );
    // Berbayar → buka checkout (register + bayar simulasi)
    return (
      <button
        type="button"
        onClick={onPay}
        className="inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
      >
        Daftar &amp; Bayar · {formatRupiah(event!.price)}
      </button>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
      <Link href="/events" className="text-sm font-medium text-ink-400 hover:text-ink-900">
        ← Semua event
      </Link>

      {/* Banner */}
      <div className="mt-4 overflow-hidden rounded-3xl bg-ink-900/5">
        {event.banner_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={encodeURI(event.banner_url)} alt={event.title} className="h-64 w-full object-cover sm:h-80" />
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,320px]">
        {/* Konten */}
        <div>
          {event.event_categories && (
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: event.event_categories.color ?? "#6366f1" }}
            >
              {event.event_categories.name}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{event.title}</h1>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-600">{event.description}</p>
          {event.organizer_name && (
            <p className="mt-6 text-sm text-ink-400">Diselenggarakan oleh <b className="text-ink-600">{event.organizer_name}</b></p>
          )}
        </div>

        {/* Sidebar CTA */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-ink-900/10 p-6">
            <p className="text-2xl font-bold text-ink-900">{free ? "Gratis" : formatRupiah(event.price)}</p>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-400">Tanggal</dt>
                <dd className="text-right font-medium text-ink-800">{formatDateID(event.event_date)}</dd>
              </div>
              {event.location && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-400">Lokasi</dt>
                  <dd className="text-right font-medium text-ink-800">{event.location}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-ink-400">Kuota</dt>
                <dd className={`text-right font-medium ${full ? "text-red-500" : "text-ink-800"}`}>
                  {full ? "Penuh" : `${remaining} tersisa`}
                </dd>
              </div>
              {event.registration_deadline && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-400">Batas daftar</dt>
                  <dd className="text-right font-medium text-ink-800">{formatDateID(event.registration_deadline)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6">{renderCTA()}</div>
            {error && <p className="mt-3 text-center text-sm font-medium text-red-600">{error}</p>}
          </div>
        </aside>
      </div>

      {checkoutOpen && runnerRef.current && (
        <CheckoutPanel
          open
          variant="modal"
          subtitle={`${event.title} · ${formatDateID(event.event_date)}`}
          lines={[{ label: event.title, amount: Number(event.price) }]}
          subtotal={Number(event.price)}
          total={Number(event.price)}
          itemNoun="registrasi"
          run={runnerRef.current}
          successHref="/dashboard"
          successLabel="Lihat Event Saya"
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </main>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <>
      <Navbar />
      <Detail slug={slug} />
      <Footer />
    </>
  );
}
