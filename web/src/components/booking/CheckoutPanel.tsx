"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { formatRupiah } from "@/lib/format";
import { getErrorMessage } from "@/lib/error";
import type { CheckoutLine, CheckoutOutcome, CheckoutRunner } from "@/lib/checkout";

interface Props {
  open: boolean;
  onClose: () => void;
  variant?: "modal" | "inline";
  title?: string;
  subtitle?: string;
  lines: CheckoutLine[];
  discount?: { label: string; amount: number } | null;
  subtotal: number;
  total: number;
  itemNoun?: string; // "booking" | "tiket" | "membership"
  note?: string;
  run: CheckoutRunner;
  onDone?: () => void; // dipanggil setelah paid (invalidate/clear)
  onPhase?: (phase: Phase) => void;
  allowSimulateFailure?: boolean;
  successHref?: string;
  successLabel?: string;
  disabled?: boolean;
}

type Phase = "review" | "processing" | "paid" | "failed" | "error";

export default function CheckoutPanel({
  open,
  onClose,
  variant = "modal",
  title = "Ringkasan Pesanan",
  subtitle,
  lines,
  discount,
  subtotal,
  total,
  itemNoun = "item",
  note = "Pembayaran ini simulasi (tanpa biaya nyata) — mengganti gateway asli untuk demo.",
  run,
  onDone,
  onPhase,
  allowSimulateFailure = false,
  successHref = "/dashboard",
  successLabel = "Lihat Booking Saya",
  disabled = false,
}: Props) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("review");
  const [result, setResult] = useState<CheckoutOutcome | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPhase("review");
      setResult(null);
      setError("");
    }
  }, [open]);

  // Notifikasi perubahan fase ke parent (mis. untuk stepper wizard).
  useEffect(() => {
    onPhase?.(phase);
  }, [phase, onPhase]);

  // Animasi masuk: fade + slide via autoAlpha (hormati prefers-reduced-motion).
  useEffect(() => {
    if (!open || !cardRef.current) return;
    const node = cardRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) gsap.set(node, { autoAlpha: 1, y: 0 });
    else gsap.fromTo(node, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" });
    node.focus();
    return () => gsap.killTweensOf(node);
  }, [open]);

  // Esc menutup (modal saja, kecuali sedang memproses).
  useEffect(() => {
    if (!open || variant !== "modal") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "processing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase, onClose, variant]);

  if (!open) return null;

  async function process(outcome: "success" | "failure") {
    setPhase("processing");
    setError("");
    try {
      const res = await run(outcome);
      setResult(res);
      if (res.status === "paid") {
        setPhase("paid");
        onDone?.();
      } else {
        setPhase("failed");
      }
    } catch (e) {
      setError(getErrorMessage(e)); // pesan spesifik backend (422 kuota, 409 membership, …)
      setPhase("error");
    }
  }

  const card = (
    <div
      ref={cardRef}
      tabIndex={-1}
      className={
        variant === "modal"
          ? "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl outline-none sm:rounded-3xl sm:p-8"
          : "mx-auto w-full max-w-lg rounded-3xl border border-ink-900/10 bg-white p-6 outline-none sm:p-8"
      }
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
            {result.confirmedCount ?? 0} {itemNoun} dikonfirmasi
            {(result.failedCount ?? 0) > 0 && (
              <span className="text-neon-pink"> · {result.failedCount} gagal</span>
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
              <dd className="font-mono font-semibold text-ink-900">{result.invoiceNumber ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500">Referensi</dt>
              <dd className="truncate font-mono text-ink-700">{result.referenceId ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Total dibayar</dt>
              <dd className="text-base font-semibold text-ink-900">{formatRupiah(result.finalAmount)}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => router.push(successHref)}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
            >
              {successLabel}
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
        /* ---- Gagal ---- */
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
            !
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-ink-900">Pembayaran Gagal</h3>
          <p className="mt-1 text-sm text-ink-500">
            Pembayaran belum selesai. Coba bayar lagi, atau kelola pesananmu di dashboard.
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
              onClick={() => router.push(successHref)}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
            >
              Ke Dashboard
            </button>
          </div>
        </div>
      ) : phase === "error" ? (
        /* ---- Error ---- */
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
            !
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-ink-900">Terjadi Kesalahan</h3>
          <p className="mt-1 text-sm text-ink-500">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => process("success")}
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
          <h3 className="text-2xl font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}

          <ul className="mt-5 divide-y divide-ink-900/10">
            {lines.map((l, i) => (
              <li key={i} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-ink-800">{l.label}</span>
                <span className="flex items-center gap-2">
                  {l.strikethrough != null && l.strikethrough > l.amount && (
                    <span className="text-xs text-ink-400 line-through">{formatRupiah(l.strikethrough)}</span>
                  )}
                  <span className="font-semibold text-ink-900">{formatRupiah(l.amount)}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-ink-900/10 pt-4">
            {discount && discount.amount > 0 && (
              <>
                <div className="flex justify-between text-sm text-ink-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-neon-purple">
                  <span>{discount.label}</span>
                  <span>−{formatRupiah(discount.amount)}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-medium text-ink-500">Total</span>
              <span className="text-2xl font-semibold text-ink-900">{formatRupiah(total)}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-ink-400">{note}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => process("success")}
              disabled={disabled}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
                disabled ? "cursor-not-allowed bg-ink-900/10 text-ink-400" : "bg-ink-900 text-white hover:bg-neon-pink"
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

          {allowSimulateFailure && (
            <button
              type="button"
              onClick={() => process("failure")}
              className="mt-3 w-full text-center text-xs text-ink-400 underline decoration-dotted underline-offset-2 transition-colors hover:text-ink-600"
            >
              Simulasikan pembayaran gagal
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === "inline") return card;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && phase !== "processing") onClose();
      }}
    >
      {card}
    </div>
  );
}
