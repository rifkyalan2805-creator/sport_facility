"use client";

import type { DatePill } from "@/lib/format";

interface DatePickerProps {
  pills: DatePill[];
  selected: string;
  onSelect: (iso: string) => void;
}

/** Deret pill tanggal horizontal. Akhir pekan diberi aksen berbeda. */
export default function DatePicker({ pills, selected, onSelect }: DatePickerProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2"
      role="radiogroup"
      aria-label="Pilih tanggal"
    >
      {pills.map((p) => {
        const active = p.iso === selected;
        return (
          <button
            key={p.iso}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(p.iso)}
            className={`flex min-w-[68px] shrink-0 flex-col items-center rounded-2xl border px-3 py-2.5 outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
              active
                ? "border-transparent bg-ink-900 text-white"
                : "border-ink-900/10 bg-white text-ink-700 hover:border-ink-900/30"
            }`}
          >
            <span
              className={`text-xs font-medium uppercase tracking-wide ${
                active ? "text-white/70" : p.weekend ? "text-neon-pink" : "text-ink-400"
              }`}
            >
              {p.dayShort}
            </span>
            <span className="mt-0.5 text-lg font-semibold leading-none">{p.dayNum}</span>
            <span className={`mt-1 text-[11px] ${active ? "text-white/60" : "text-ink-400"}`}>
              {p.isToday ? "Hari ini" : p.month}
            </span>
          </button>
        );
      })}
    </div>
  );
}
