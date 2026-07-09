"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  courtName: string;
  dateLabel: string;
  start: string;
  end: string;
  submitting: boolean;
  success: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Konfirmasi masuk antrean untuk slot yang sudah dibooking.
 * Presentasional — parent yang memegang mutasi (state submitting/success/error).
 */
export default function WaitlistDialog({
  open,
  courtName,
  dateLabel,
  start,
  end,
  submitting,
  success,
  error,
  onConfirm,
  onClose,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/50 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Masuk antrean"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
        {success ? (
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-ink-900">Kamu masuk antrean</h3>
            <p className="mt-1 text-sm text-ink-500">
              Kami beri tahu bila slot <b className="text-ink-700">{start}–{end}</b> tersedia (mis. ada pembatalan). Pantau di dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40"
              >
                Lihat Antrean Saya
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-2xl font-semibold text-ink-900">Masuk antrean?</h3>
            <p className="mt-1 text-sm text-ink-500">
              Slot ini sudah dibooking. Masuk antrean — kami beri tahu bila slot menjadi tersedia.
            </p>

            <dl className="mt-5 space-y-2 rounded-2xl bg-ink-900/[0.03] p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Lapangan</dt>
                <dd className="text-right font-medium text-ink-900">{courtName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Tanggal</dt>
                <dd className="text-right font-medium text-ink-900">{dateLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Jam</dt>
                <dd className="text-right font-medium text-ink-900">{start}–{end}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white outline-none transition-colors duration-200 hover:bg-neon-pink focus-visible:ring-4 focus-visible:ring-neon-purple/40 disabled:opacity-50"
              >
                {submitting ? "Memproses…" : "Ya, antre"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium text-ink-700 outline-none transition-colors duration-200 hover:bg-ink-900/5 disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
