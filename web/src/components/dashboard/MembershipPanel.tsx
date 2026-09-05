"use client";

import MemberCard from "@/components/membership/MemberCard";
import { useMyMemberships, useCancelMembership, type Membership } from "@/lib/queries";
import { formatDateID } from "@/lib/format";
import {
  Badge,
  EmptyState,
  ErrorState,
  ListSkeleton,
  sisaBerlaku,
} from "@/components/dashboard/common";

const STATUS: Record<Membership["status"], { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-100 text-green-700" },
  pending: { label: "Menunggu", cls: "bg-amber-100 text-amber-700" },
  expired: { label: "Kadaluarsa", cls: "bg-ink-900/10 text-ink-700" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-100 text-red-600" },
};

/** Member card membership kolam yang sedang aktif, atau ajakan mendaftar. */
export function ActiveMemberCard() {
  const { data = [], isLoading } = useMyMemberships();
  if (isLoading) return <ListSkeleton rows={1} />;

  const aktif = data.find((m) => m.status === "active");
  if (!aktif)
    return (
      <EmptyState
        text="Belum punya membership kolam yang aktif."
        ctaHref="/membership/daftar"
        ctaLabel="Daftar Membership"
      />
    );

  return (
    <div>
      <MemberCard
        memberName={aktif.member_name ?? "Member"}
        planName={aktif.membership_plans?.name ?? "Membership"}
        photoUrl={aktif.photo_url}
        cardNumber={aktif.card_number}
        startDate={aktif.start_date}
        endDate={aktif.end_date}
        status={aktif.status}
      />
      <p className="mt-3 text-sm text-ink-500">
        Berlaku sampai <strong className="text-ink-900">{formatDateID(aktif.end_date)}</strong>{" "}
        · {sisaBerlaku(aktif.end_date)}
      </p>
    </div>
  );
}

/** Riwayat seluruh membership (aktif, menunggu, kadaluarsa, batal). */
export function MembershipHistory() {
  const { data = [], isLoading, isError } = useMyMemberships();
  const cancel = useCancelMembership();

  if (isLoading) return <ListSkeleton />;
  if (isError) return <ErrorState>Gagal memuat membership. Coba muat ulang halaman.</ErrorState>;
  if (data.length === 0)
    return (
      <EmptyState
        text="Belum pernah berlangganan membership kolam."
        ctaHref="/membership/daftar"
        ctaLabel="Daftar Membership"
      />
    );

  return (
    <ul className="space-y-3">
      {data.map((m) => {
        const s = STATUS[m.status] ?? STATUS.pending;
        const bisaBatal = m.status === "active" || m.status === "pending";
        return (
          <li
            key={m.id}
            className="flex flex-col gap-3 rounded-2xl border border-ink-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink-900">
                  {m.membership_plans?.name ?? "Membership"}
                </p>
                <Badge label={s.label} cls={s.cls} />
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {formatDateID(m.start_date)} – {formatDateID(m.end_date)}
                {m.card_number && (
                  <span className="ml-1 font-mono text-ink-400">· {m.card_number}</span>
                )}
              </p>
            </div>
            {bisaBatal && (
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
  );
}
