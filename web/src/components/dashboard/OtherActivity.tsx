"use client";

import {
  useMyPoolTickets,
  useCancelPoolTicket,
  useMyEventRegistrations,
  useCancelEventRegistration,
  useMyWaitingList,
  useCancelWaitingList,
  type PoolTicket,
  type EventRegistration,
  type WaitingEntry,
} from "@/lib/queries";
import { formatRupiah, formatDateID, formatTimeISO } from "@/lib/format";
import { Badge, EmptyState, ListSkeleton } from "@/components/dashboard/common";

// ---- Tiket kolam ----

const POOL_STATUS: Record<PoolTicket["status"], { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-100 text-green-700" },
  used: { label: "Terpakai", cls: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
  expired: { label: "Kadaluarsa", cls: "bg-ink-900/10 text-ink-700" },
};

export function PoolTickets() {
  const { data = [], isLoading } = useMyPoolTickets();
  const cancel = useCancelPoolTicket();

  if (isLoading) return <ListSkeleton rows={2} />;
  if (data.length === 0)
    return (
      <EmptyState text="Belum ada tiket kolam." ctaHref="/booking/pool" ctaLabel="Beli Tiket" />
    );

  return (
    <ul className="space-y-3">
      {data.map((t) => {
        const s = POOL_STATUS[t.status] ?? POOL_STATUS.active;
        return (
          <li
            key={t.id}
            className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink-900">
                  {t.pool_sessions?.name ?? "Sesi Kolam"}
                </p>
                <Badge label={s.label} cls={s.cls} />
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {t.pool_sessions?.session_date ? formatDateID(t.pool_sessions.session_date) : "—"}{" "}
                · {t.quantity} orang ·{" "}
                <span className="font-mono text-ink-400">{t.qr_code.slice(0, 13)}…</span>
              </p>
            </div>
            <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
              <p className="text-lg font-semibold text-ink-900">{formatRupiah(t.total_price)}</p>
              {t.status === "active" && (
                <button
                  type="button"
                  onClick={() => window.confirm("Batalkan tiket ini?") && cancel.mutate(t.id)}
                  disabled={cancel.isPending && cancel.variables === t.id}
                  className="text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600 disabled:opacity-50"
                >
                  {cancel.isPending && cancel.variables === t.id ? "Membatalkan…" : "Batalkan"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ---- Event ----

const EVENT_STATUS: Record<EventRegistration["status"], { label: string; cls: string }> = {
  registered: { label: "Menunggu bayar", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Terkonfirmasi", cls: "bg-green-100 text-green-700" },
  checked_in: { label: "Check-in", cls: "bg-blue-100 text-blue-700" },
  waitlisted: { label: "Daftar tunggu", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};
const EVENT_CANCELLABLE: EventRegistration["status"][] = ["registered", "confirmed"];

export function EventRegistrations() {
  const { data = [], isLoading } = useMyEventRegistrations();
  const cancel = useCancelEventRegistration();

  if (isLoading) return <ListSkeleton rows={2} />;
  if (data.length === 0)
    return <EmptyState text="Belum ada event yang diikuti." ctaHref="/events" ctaLabel="Lihat Event" />;

  return (
    <ul className="space-y-3">
      {data.map((r) => {
        const s = EVENT_STATUS[r.status] ?? EVENT_STATUS.registered;
        return (
          <li
            key={r.id}
            className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink-900">{r.events?.title ?? "Event"}</p>
                <Badge label={s.label} cls={s.cls} />
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {r.events?.event_date ? formatDateID(r.events.event_date) : "—"}
              </p>
            </div>
            {EVENT_CANCELLABLE.includes(r.status) && (
              <button
                type="button"
                onClick={() =>
                  window.confirm("Batalkan registrasi event ini?") && cancel.mutate(r.id)
                }
                disabled={cancel.isPending && cancel.variables === r.id}
                className="text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600 disabled:opacity-50"
              >
                {cancel.isPending && cancel.variables === r.id ? "Membatalkan…" : "Batalkan"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---- Antrean (waiting list) ----

const WAITING_STATUS: Record<WaitingEntry["status"], { label: string; cls: string }> = {
  waiting: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
  notified: { label: "Slot tersedia!", cls: "bg-green-100 text-green-700" },
  booked: { label: "Berhasil booking", cls: "bg-blue-100 text-blue-700" },
  expired: { label: "Kedaluwarsa", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};
const WAITING_CANCELLABLE: WaitingEntry["status"][] = ["waiting", "notified"];

export function WaitingList() {
  const { data = [], isLoading } = useMyWaitingList();
  const cancel = useCancelWaitingList();

  if (isLoading) return <ListSkeleton rows={2} />;
  if (data.length === 0) return <EmptyState text="Tidak sedang mengantre slot mana pun." />;

  return (
    <ul className="space-y-3">
      {data.map((e) => {
        const s = WAITING_STATUS[e.status] ?? WAITING_STATUS.waiting;
        return (
          <li
            key={e.id}
            className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink-900">{e.courts?.name ?? "Lapangan"}</p>
                <Badge label={s.label} cls={s.cls} />
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {formatDateID(e.preferred_date)} · {formatTimeISO(e.preferred_start)}–
                {formatTimeISO(e.preferred_end)}
              </p>
            </div>
            {WAITING_CANCELLABLE.includes(e.status) && (
              <button
                type="button"
                onClick={() => window.confirm("Batalkan antrean ini?") && cancel.mutate(e.id)}
                disabled={cancel.isPending && cancel.variables === e.id}
                className="text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600 disabled:opacity-50"
              >
                {cancel.isPending && cancel.variables === e.id ? "Membatalkan…" : "Batalkan"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
