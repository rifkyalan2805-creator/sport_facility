"use client";

import { formatDateID, formatTimeISO } from "@/lib/format";
import type { PoolSession } from "@/lib/queries";

interface Props {
  session: PoolSession;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** Kartu satu sesi kolam: tanggal, jam, sisa kuota. Non-aktif bila penuh/tutup. */
export default function PoolSessionCard({ session, selected, onSelect }: Props) {
  const remaining = Math.max(0, session.capacity - session.booked_count);
  const disabled = session.status !== "open" || remaining === 0;

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(session.id)}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex flex-col rounded-2xl border p-5 text-left outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
        disabled
          ? "cursor-not-allowed border-ink-900/10 bg-ink-900/[0.03] opacity-60"
          : selected
            ? "border-neon-pink bg-neon-pink/[0.04] ring-2 ring-neon-pink"
            : "cursor-pointer border-ink-900/10 hover:border-ink-900/25"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          {formatTimeISO(session.start_time)}–{formatTimeISO(session.end_time)}
        </span>
        {selected && (
          <span className="rounded-full bg-neon-pink px-2 py-0.5 text-xs font-semibold text-white">
            Dipilih
          </span>
        )}
        {disabled && (
          <span className="rounded-full bg-ink-900/10 px-2 py-0.5 text-xs font-semibold text-ink-500">
            {session.status === "open" ? "Penuh" : "Tutup"}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-ink-900">{session.name}</h3>
      <p className="mt-0.5 text-sm text-ink-500">{formatDateID(session.session_date)}</p>
      <p className="mt-3 text-sm">
        <span className="font-semibold text-ink-900">{remaining}</span>
        <span className="text-ink-400"> / {session.capacity} kursi tersisa</span>
      </p>
    </button>
  );
}
