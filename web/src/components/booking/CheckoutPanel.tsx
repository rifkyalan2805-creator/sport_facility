"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useQueryClient } from "@tanstack/react-query";
import { formatRupiah } from "@/lib/format";
import {
  createBookings,
  createPayment,
  settlePayment,
  type CreatedBooking,
  type PaymentInfo,
  type SettleResult,
} from "@/lib/checkout";
import type { Court, Slot } from "@/lib/queries";

interface Props {
  open: boolean;
  court?: Court;
  date: string;
  dateLabel: string;
  slots: Slot[];
  total: number;
  onClose: () => void;
  onConsumed: () => void; // slot sudah jadi booking → kosongkan pilihan parent
}

type Phase = "review" | "processing" | "paid" | "failed" | "error";

export default function CheckoutPanel({
  open,
  court,
  date,
  dateLabel,
  slots,
  total,
  onClose,
  onConsumed,
}: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("review");
  const [bookings, setBookings] = useState<CreatedBooking[] | null>(null);
  const [failedCount, setFailedCount] = useState(0);
  const [payInfo, setPayInfo] = useState<PaymentInfo | null>(null);
  const [result, setResult] = useState<SettleResult | null>(null);
  const [error, setError] = useState("");

  // Reset penuh tiap kali panel dibuka.
  useEffect(() => {
    if (open) {
      setPhase("review");
      setBookings(null);
      setFailedCount(0);
      setPayInfo(null);
      setResult(null);
      setError("");
    }
  }, [open]);

  // Animasi masuk: fade + slide via autoAlpha (hormati prefers-reduced-motion).
  useEffect(() => {
    if (!open || !cardRef.current) return;
    const node = cardRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) gsap.set(node, { autoAlpha: 1, y: 0 });
    else
      gsap.fromTo(
        node,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
    node.focus();
    return () => gsap.killTweensOf(node);
  }, [open]);

  // Esc menutup (kecuali saat sedang memproses).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "processing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  if (!open || !court) return null;

  async function process(outcome: "success" | "failure") {
    if (!court) return;
    setPhase("processing");
    setError("");
    try {
      // Fase 1 — buat booking sekali saja (retry tak mengulanginya).
      let bk = bookings;
      if (!bk) {
        const res = await createBookings(court.id, date, slots);
        bk = res.bookings;
        setBookings(bk);
        setFailedCount(res.failedCount);
        onConsumed(); // slot sudah dikonsumsi → kosongkan pilihan di parent
        qc.invalidateQueries({ queryKey: ["availability", court.id, date] });
      }
      // Fase 2 — pembayaran baru untuk booking tsb.
      const info = await createPayment(bk, court.name, date);
      setPayInfo(info);
      // Fase 3 — settle.
      const settled = await settlePayment(info.paymentId, outcome);
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      if (outcome === "success") {
        setResult(settled);
        setPhase("paid");
      } else {
        setPhase("failed");
      }
    } catch (e) {
      qc.invalidateQueries({ queryKey: ["availability", court.id, date] });
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.");
      setPhase("error");
    }
  }

  const failedTotal =
    payInfo?.finalAmount ?? (bookings?.reduce((s, b) => s + b.totalPrice, 0) ?? 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout booking padel"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && phase !== "processing") onClose();
      }}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl outline-none sm:rounded-3xl sm:p-8"
      >
        {phase === "processing" ? (
          <div className="py-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-ink-900/15 border-t-neon-purple" />
            <p className="mt-4 text-sm font-medium text-ink-600">Memproses pembayaran…</p>
          </div>
        ) : phase === "paid" && result ? (
          /* ---- Struk ---- */
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-ink-900">Pembayaran Berhasil</h3>
            <p className="mt-1 text-sm text-ink-500">
              {bookings?.length ?? 0} booking dikonfirmasi
              {failedCount > 0 && (
                <span className="text-neon-pink"> · {failedCount} slot gagal (sudah dipesan)</span>
              )}
              .
            </p>

            <dl className="mt-6 space-y-2 rounded-2xl bg-ink-900/[0.03] p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Status</dt>
                <dd className="font-semibold text-green-600">Lunas</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">No. Invoice</dt>
                <dd className="font-mono font-semibold text-ink-900">
                  {result.invoiceNumber ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Referensi</dt>
                <dd className="truncate font-mono text-ink-700">{result.referenceId ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Total dibayar</dt>
                <dd className="text-base font-semibold text-ink-900">
                  {formatRupiah(result.finalAmount)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
              >
                Lihat Booking Saya
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : phase === "failed" ? (
          /* ---- Pembayaran gagal (booking tetap pending) ---- */
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
              !
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-ink-900">Pembayaran Gagal</h3>
            <p className="mt-1 text-sm text-ink-500">
              {bookings?.length ?? 0} booking dibuat dengan status <b>Menunggu</b> ({formatRupiah(failedTotal)}).
              Selesaikan pembayaran, atau batalkan di dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => process("success")}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
              >
                Coba Bayar Lagi
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
              >
                Ke Dashboard
              </button>
            </div>
          </div>
        ) : phase === "error" ? (
          /* ---- Error tak terduga ---- */
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
              !
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-ink-900">Terjadi Kesalahan</h3>
            <p className="mt-1 text-sm text-ink-500">{error}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => (bookings ? process("success") : setPhase("review"))}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* ---- Review ---- */
          <div>
            <h3 className="text-2xl font-semibold text-ink-900">Ringkasan Pesanan</h3>
            <p className="mt-1 text-sm text-ink-500">
              {court.name} · {dateLabel}
            </p>

            <ul className="mt-5 divide-y divide-ink-900/10">
              {slots.map((s) => {
                const discounted = s.basePrice > s.price;
                return (
                  <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-medium text-ink-800">
                      {s.start}–{s.end}
                    </span>
                    <span className="flex items-center gap-2">
                      {discounted && (
                        <span className="text-xs text-ink-400 line-through">
                          {formatRupiah(s.basePrice)}
                        </span>
                      )}
                      <span className="font-semibold text-ink-900">{formatRupiah(s.price)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-ink-900/10 pt-4">
              <span className="text-sm font-medium text-ink-500">Total</span>
              <span className="text-2xl font-semibold text-ink-900">{formatRupiah(total)}</span>
            </div>

            <p className="mt-3 text-xs text-ink-400">
              Pembayaran ini <b>simulasi</b> (tanpa biaya nyata) — mengganti gateway asli untuk demo.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => process("success")}
                disabled={slots.length === 0}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
                  slots.length === 0
                    ? "cursor-not-allowed bg-ink-900/10 text-ink-400"
                    : "bg-ink-900 text-white hover:bg-neon-pink"
                }`}
              >
                Bayar (simulasi) · {formatRupiah(total)}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
              >
                Kembali
              </button>
            </div>

            <button
              type="button"
              onClick={() => process("failure")}
              className="mt-3 w-full text-center text-xs text-ink-400 underline decoration-dotted underline-offset-2 transition-colors hover:text-ink-600"
            >
              Simulasikan pembayaran gagal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
