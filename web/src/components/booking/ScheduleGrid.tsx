"use client";

import type { AvailabilityResult, Court, Slot } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

interface ScheduleGridProps {
  court?: Court;
  result?: AvailabilityResult;
  loading: boolean;
  selectedIds: Set<string>;
  onToggle: (slot: Slot) => void;
  /** Bila diisi, slot "booked" jadi bisa diklik untuk masuk antrean. */
  onJoinWaitlist?: (slot: Slot) => void;
}

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3";

/** Kiri: gambar + info court. Kanan: grid slot waktu untuk tanggal terpilih. */
export default function ScheduleGrid({
  court,
  result,
  loading,
  selectedIds,
  onToggle,
  onJoinWaitlist,
}: ScheduleGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-[300px,1fr]">
      {/* Kiri — court terpilih */}
      <aside className="self-start md:sticky md:top-24">
        <div className="overflow-hidden rounded-3xl bg-ink-900/5">
          {court?.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={encodeURI(court.image_url)}
              alt={court.name}
              className="h-48 w-full object-cover md:h-56"
            />
          ) : (
            <div className="h-48 w-full md:h-56" />
          )}
        </div>
        <h3 className="mt-4 text-xl font-semibold text-ink-900">{court?.name ?? "—"}</h3>
        <p className="mt-1 text-sm text-ink-500">{court?.description ?? "Lapangan padel"}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-ink-900/5 px-2.5 py-1 text-xs text-ink-600">
            {court?.is_indoor ? "Indoor" : "Outdoor"}
          </span>
          {court?.facilities?.map((f) => (
            <span key={f} className="rounded-full bg-ink-900/5 px-2.5 py-1 text-xs text-ink-600">
              {f}
            </span>
          ))}
        </div>
      </aside>

      {/* Kanan — grid slot */}
      <div>
        {loading ? (
          <div className={GRID}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink-900/5" />
            ))}
          </div>
        ) : result?.closed ? (
          <p className="rounded-2xl bg-ink-900/5 p-6 text-center text-ink-500">
            Lapangan tutup pada tanggal ini.
          </p>
        ) : !result?.slots.length ? (
          <p className="rounded-2xl bg-ink-900/5 p-6 text-center text-ink-500">
            Belum ada slot untuk tanggal ini.
          </p>
        ) : (
          <div className={GRID}>
            {result.slots.map((s) => {
              const isSelected = selectedIds.has(s.id);
              const booked = s.status === "booked";
              const canWaitlist = booked && Boolean(onJoinWaitlist);
              const discounted = s.price !== s.basePrice;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={booked && !canWaitlist}
                  aria-pressed={isSelected}
                  onClick={() => (booked ? onJoinWaitlist?.(s) : onToggle(s))}
                  className={`flex flex-col rounded-2xl border p-3 text-left outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/40 ${
                    booked
                      ? canWaitlist
                        ? "cursor-pointer border-amber-300/70 bg-amber-50/50 hover:border-amber-400"
                        : "cursor-not-allowed border-ink-900/5 bg-ink-900/[0.03] opacity-60"
                      : isSelected
                        ? "border-neon-pink bg-neon-pink/5"
                        : "border-ink-900/10 bg-white hover:border-neon-purple/60"
                  }`}
                >
                  <span className="text-xs font-medium text-ink-400">{s.durationMin} menit</span>
                  <span className="mt-0.5 text-base font-semibold text-ink-900">
                    {s.start}–{s.end}
                  </span>
                  {booked ? (
                    <span
                      className={`mt-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        canWaitlist ? "bg-amber-100 text-amber-700" : "bg-ink-900/10 text-ink-500"
                      }`}
                    >
                      {canWaitlist ? "Booked · Antre" : "Booked"}
                    </span>
                  ) : (
                    <span className="mt-1.5">
                      {discounted && (
                        <span className="mr-1 text-xs text-ink-400 line-through">
                          {formatRupiah(s.basePrice)}
                        </span>
                      )}
                      <span className="text-sm font-bold text-ink-900">{formatRupiah(s.price)}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
