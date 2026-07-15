import { formatDateID } from "@/lib/format";
import { assetUrl } from "@/lib/asset";

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-400/20 text-green-200 ring-green-300/40" },
  pending: { label: "Menunggu bayar", cls: "bg-amber-400/20 text-amber-100 ring-amber-300/40" },
  expired: { label: "Kedaluwarsa", cls: "bg-white/15 text-white/70 ring-white/25" },
  cancelled: { label: "Dibatalkan", cls: "bg-red-400/25 text-red-100 ring-red-300/40" },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((w) => w[0]?.toUpperCase() ?? "").join("") || "M";
}

export interface MemberCardProps {
  memberName: string;
  planName: string;
  photoUrl?: string | null;
  cardNumber?: string | null;
  startDate: string;
  endDate: string;
  status: string; // membership_status
  className?: string;
}

/** Kartu member reusable (e-card). Foto fallback ke inisial bila kosong. */
export default function MemberCard({
  memberName,
  planName,
  photoUrl,
  cardNumber,
  startDate,
  endDate,
  status,
  className = "",
}: MemberCardProps) {
  const s = STATUS[status] ?? STATUS.pending;
  const photo = assetUrl(photoUrl);

  return (
    <div
      className={`relative w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-neon-purple via-ink-900 to-ink-900 p-6 text-white shadow-xl shadow-ink-900/30 ${className}`}
    >
      {/* dekor cahaya */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-neon-pink/30 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue" />
          <span className="text-sm font-semibold tracking-tight">SportHub</span>
        </span>
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${s.cls}`}>
          {s.label}
        </span>
      </div>

      <p className="relative mt-1 text-[11px] font-medium uppercase tracking-[0.25em] text-white/50">
        Member Card
      </p>

      <div className="relative mt-5 flex items-center gap-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={memberName}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-white/20"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold ring-2 ring-white/20">
            {initials(memberName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold">{memberName}</p>
          <p className="mt-0.5 text-sm text-white/60">{planName}</p>
        </div>
      </div>

      <div className="relative mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/40">No. Kartu</p>
          <p className="font-mono text-sm font-semibold">{cardNumber ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-white/40">Berlaku</p>
          <p className="text-sm font-medium">
            {formatDateID(startDate)} – {formatDateID(endDate)}
          </p>
        </div>
      </div>
    </div>
  );
}
