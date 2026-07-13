"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageNav from "@/components/PageNav";
import RequireAuth from "@/components/auth/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import {
  useMyBookings,
  useCancelBooking,
  useMyPoolTickets,
  useCancelPoolTicket,
  useMyMemberships,
  useCancelMembership,
  useMyEventRegistrations,
  useCancelEventRegistration,
  useMyWaitingList,
  useCancelWaitingList,
  type Booking,
  type PoolTicket,
  type Membership,
  type EventRegistration,
  type WaitingEntry,
} from "@/lib/queries";
import { formatRupiah, formatDateID, formatTimeISO } from "@/lib/format";

const CANCELLABLE: Booking["status"][] = ["pending", "confirmed"];

const STATUS: Record<Booking["status"], { label: string; cls: string }> = {
  pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Terkonfirmasi", cls: "bg-green-100 text-green-700" },
  checked_in: { label: "Check-in", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Selesai", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }: { status: Booking["status"] }) {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function BookingsSection() {
  const { data: bookings = [], isLoading, isError } = useMyBookings();
  const cancel = useCancelBooking();

  function onCancel(id: string) {
    if (window.confirm("Batalkan booking ini?")) cancel.mutate(id);
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Booking Saya</h2>
        <Link
          href="/booking/padel"
          className="text-sm font-medium text-neon-purple transition-colors hover:text-neon-pink"
        >
          + Booking baru
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink-900/5" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-4 rounded-2xl bg-red-50 p-6 text-center text-sm text-red-600">
          Gagal memuat booking. Coba muat ulang halaman.
        </p>
      ) : bookings.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-ink-900/15 p-8 text-center">
          <p className="text-ink-500">Belum ada booking.</p>
          <Link
            href="/booking/padel"
            className="mt-3 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neon-pink"
          >
            Booking Lapangan Padel
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-900">{b.courts?.name ?? "Lapangan"}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-ink-500">
                  {formatDateID(b.booking_date)} · {formatTimeISO(b.start_time)}–
                  {formatTimeISO(b.end_time)}
                  <span className="ml-1 capitalize text-ink-400">· {b.booking_type}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                <p className="text-lg font-semibold text-ink-900">
                  {formatRupiah(b.total_price)}
                </p>
                {CANCELLABLE.includes(b.status) && (
                  <button
                    type="button"
                    onClick={() => onCancel(b.id)}
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
      )}
    </section>
  );
}

const POOL_STATUS: Record<PoolTicket["status"], { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-100 text-green-700" },
  used: { label: "Terpakai", cls: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
  expired: { label: "Kadaluarsa", cls: "bg-ink-900/10 text-ink-700" },
};

function PoolTicketsSection() {
  const { data: tickets = [], isLoading } = useMyPoolTickets();
  const cancel = useCancelPoolTicket();
  if (!isLoading && tickets.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink-900">Tiket Kolam Saya</h2>
      {isLoading ? (
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-ink-900/5" />
      ) : (
        <ul className="mt-4 space-y-3">
          {tickets.map((t) => {
            const s = POOL_STATUS[t.status] ?? POOL_STATUS.active;
            return (
              <li
                key={t.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{t.pool_sessions?.name ?? "Sesi Kolam"}</p>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {t.pool_sessions?.session_date ? formatDateID(t.pool_sessions.session_date) : "—"} ·{" "}
                    {t.quantity} orang · <span className="font-mono text-ink-400">{t.qr_code.slice(0, 13)}…</span>
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
      )}
    </section>
  );
}

const MEMBER_STATUS: Record<Membership["status"], { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-100 text-green-700" },
  pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
  expired: { label: "Kadaluarsa", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};

function MembershipsSection() {
  const { data: memberships = [], isLoading } = useMyMemberships();
  const cancel = useCancelMembership();
  if (!isLoading && memberships.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink-900">Membership Saya</h2>
      {isLoading ? (
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-ink-900/5" />
      ) : (
        <ul className="mt-4 space-y-3">
          {memberships.map((m) => {
            const s = MEMBER_STATUS[m.status] ?? MEMBER_STATUS.pending;
            const cancellable = m.status === "active" || m.status === "pending";
            return (
              <li
                key={m.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{m.membership_plans?.name ?? "Membership"}</p>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {formatDateID(m.start_date)} – {formatDateID(m.end_date)}
                  </p>
                </div>
                {cancellable && (
                  <button
                    type="button"
                    onClick={() => window.confirm("Batalkan membership ini?") && cancel.mutate(m.id)}
                    disabled={cancel.isPending && cancel.variables === m.id}
                    className="text-sm font-medium text-ink-400 outline-none transition-colors hover:text-red-600 focus-visible:text-red-600 disabled:opacity-50"
                  >
                    {cancel.isPending && cancel.variables === m.id ? "Membatalkan…" : "Batalkan"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const EVENT_STATUS: Record<EventRegistration["status"], { label: string; cls: string }> = {
  registered: { label: "Menunggu bayar", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Terkonfirmasi", cls: "bg-green-100 text-green-700" },
  checked_in: { label: "Check-in", cls: "bg-blue-100 text-blue-700" },
  waitlisted: { label: "Daftar tunggu", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};
const EVENT_CANCELLABLE: EventRegistration["status"][] = ["registered", "confirmed"];

function EventsSection() {
  const { data: regs = [], isLoading } = useMyEventRegistrations();
  const cancel = useCancelEventRegistration();
  if (!isLoading && regs.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink-900">Event Saya</h2>
      {isLoading ? (
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-ink-900/5" />
      ) : (
        <ul className="mt-4 space-y-3">
          {regs.map((r) => {
            const s = EVENT_STATUS[r.status] ?? EVENT_STATUS.registered;
            return (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{r.events?.title ?? "Event"}</p>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {r.events?.event_date ? formatDateID(r.events.event_date) : "—"}
                  </p>
                </div>
                {EVENT_CANCELLABLE.includes(r.status) && (
                  <button
                    type="button"
                    onClick={() => window.confirm("Batalkan registrasi event ini?") && cancel.mutate(r.id)}
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
      )}
    </section>
  );
}

const WAITING_STATUS: Record<WaitingEntry["status"], { label: string; cls: string }> = {
  waiting: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
  notified: { label: "Slot tersedia!", cls: "bg-green-100 text-green-700" },
  booked: { label: "Berhasil booking", cls: "bg-blue-100 text-blue-700" },
  expired: { label: "Kedaluwarsa", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};
const WAITING_CANCELLABLE: WaitingEntry["status"][] = ["waiting", "notified"];

function WaitingListSection() {
  const { data: entries = [], isLoading } = useMyWaitingList();
  const cancel = useCancelWaitingList();
  if (!isLoading && entries.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-ink-900">Antrean Saya</h2>
      {isLoading ? (
        <div className="mt-4 h-20 animate-pulse rounded-2xl bg-ink-900/5" />
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((e) => {
            const s = WAITING_STATUS[e.status] ?? WAITING_STATUS.waiting;
            return (
              <li
                key={e.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">{e.courts?.name ?? "Lapangan"}</p>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {formatDateID(e.preferred_date)} · {formatTimeISO(e.preferred_start)}–{formatTimeISO(e.preferred_end)}
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
      )}
    </section>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <PageNav className="mb-8" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
        Dashboard
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Halo, {user?.full_name}
      </h1>
      <div className="mt-8 rounded-2xl border border-ink-900/10 p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-400">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Telepon</dt>
            <dd className="font-medium">{user?.phone}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Role</dt>
            <dd className="font-medium capitalize">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-ink-400">Email terverifikasi</dt>
            <dd className="font-medium">{user?.email_verified ? "Ya" : "Belum"}</dd>
          </div>
        </dl>
      </div>

      {isAdmin && (
        <Link
          href="/admin"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-neon-purple/30 bg-neon-purple/[0.04] p-5 outline-none transition-colors duration-200 hover:border-neon-purple/60 focus-visible:ring-4 focus-visible:ring-neon-purple/30"
        >
          <div>
            <p className="font-semibold text-ink-900">Panel Admin</p>
            <p className="mt-0.5 text-sm text-ink-500">
              Kelola registrasi abonemen &amp; data lainnya.
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-neon-purple">Buka →</span>
        </Link>
      )}

      <BookingsSection />
      <PoolTicketsSection />
      <MembershipsSection />
      <EventsSection />
      <WaitingListSection />

      <button
        onClick={onLogout}
        className="mt-10 cursor-pointer rounded-full border border-ink-900/15 px-6 py-3 text-sm font-medium transition-colors hover:bg-ink-900/5"
      >
        Keluar
      </button>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
