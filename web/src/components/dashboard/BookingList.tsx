"use client";

import {
  useMyBookings,
  useCancelBooking,
  type Booking,
  type MyBookingFilters,
} from "@/lib/queries";
import { formatRupiah, formatDateID, formatTimeISO } from "@/lib/format";
import { Badge, EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/common";

const CANCELLABLE: Booking["status"][] = ["pending", "confirmed"];

const STATUS: Record<Booking["status"], { label: string; cls: string }> = {
  pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Terkonfirmasi", cls: "bg-green-100 text-green-700" },
  checked_in: { label: "Check-in", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Selesai", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};

export function BookingStatusBadge({ status }: { status: Booking["status"] }) {
  const s = STATUS[status] ?? STATUS.pending;
  return <Badge label={s.label} cls={s.cls} />;
}

interface BookingListProps {
  filters?: MyBookingFilters;
  emptyText: string;
  ctaHref?: string;
  ctaLabel?: string;
  /** Batasi jumlah baris (dipakai halaman Ringkasan). */
  limit?: number;
  /** Sembunyikan label jenis booking — mubazir di halaman yang sudah tersaring. */
  hideType?: boolean;
}

/**
 * Daftar booking lapangan milik user. Penyaringan dikerjakan backend lewat
 * `filters`, jadi komponen ini bisa dipakai ulang untuk tenis, padel, atau
 * gabungan tanpa logika tambahan.
 */
export default function BookingList({
  filters,
  emptyText,
  ctaHref,
  ctaLabel,
  limit,
  hideType = false,
}: BookingListProps) {
  const { data = [], isLoading, isError } = useMyBookings(filters);
  const cancel = useCancelBooking();

  if (isLoading) return <ListSkeleton />;
  if (isError) return <ErrorState>Gagal memuat booking. Coba muat ulang halaman.</ErrorState>;
  if (data.length === 0)
    return <EmptyState text={emptyText} ctaHref={ctaHref} ctaLabel={ctaLabel} />;

  const rows = limit ? data.slice(0, limit) : data;

  return (
    <ul className="space-y-3">
      {rows.map((b) => (
        <li
          key={b.id}
          className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-ink-900">{b.courts?.name ?? "Lapangan"}</p>
              <BookingStatusBadge status={b.status} />
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {formatDateID(b.booking_date)} · {formatTimeISO(b.start_time)}–
              {formatTimeISO(b.end_time)}
              {!hideType && (
                <span className="ml-1 capitalize text-ink-400">· {b.booking_type}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <p className="text-lg font-semibold text-ink-900">{formatRupiah(b.total_price)}</p>
            {CANCELLABLE.includes(b.status) && (
              <button
                type="button"
                onClick={() => window.confirm("Batalkan booking ini?") && cancel.mutate(b.id)}
                disabled={cancel.isPending && cancel.variables === b.id}
                className="text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600 disabled:opacity-50"
              >
                {cancel.isPending && cancel.variables === b.id ? "Membatalkan…" : "Batalkan"}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
