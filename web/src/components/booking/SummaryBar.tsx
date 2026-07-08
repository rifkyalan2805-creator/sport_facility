"use client";

import { formatRupiah } from "@/lib/format";

interface SummaryBarProps {
  count: number;
  total: number;
  courtName?: string;
  submitting: boolean;
  message?: string | null;
  onContinue: () => void;
  unitLabel?: string; // "slot" (padel) / "orang" (pool)
  emptyLabel?: string;
}

/** Footer bar sticky: total biaya + tombol Lanjut (disabled bila belum ada slot). */
export default function SummaryBar({
  count,
  total,
  courtName,
  submitting,
  message,
  onContinue,
  unitLabel = "slot",
  emptyLabel = "Belum ada slot dipilih",
}: SummaryBarProps) {
  const disabled = count === 0 || submitting;
  return (
    <div className="sticky bottom-0 z-20 border-t border-ink-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-500">
            {count > 0 ? `${count} ${unitLabel} · ${courtName ?? ""}` : emptyLabel}
          </p>
          <p className="text-2xl font-semibold text-ink-900">{formatRupiah(total)}</p>
          {message && <p className="mt-0.5 text-sm font-medium text-neon-purple">{message}</p>}
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
            disabled
              ? "cursor-not-allowed bg-ink-900/10 text-ink-400"
              : "bg-ink-900 text-white hover:bg-neon-pink"
          }`}
        >
          {submitting ? "Memproses…" : "Lanjut"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
