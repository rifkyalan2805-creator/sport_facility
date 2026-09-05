"use client";

import type { ExpiryGroup, AdminUserRef } from "@/lib/queries";

/**
 * Badge & filter masa berlaku untuk tabel admin (Member Kolam, Abonemen Aktif).
 *
 * Kelompoknya DIHITUNG DI BACKEND (`src/utils/expiry.ts`) dan dikirim per baris
 * sebagai `expiry_group`, jadi badge di sini tidak pernah berbeda pendapat
 * dengan filter yang dipakai query — komponen ini hanya menggambar.
 */

/** Sama dengan WARNING_DAYS di backend. Dipakai untuk teks bantuan saja. */
export const WARNING_DAYS = 7;

interface GroupMeta {
  label: string;
  /** Teks tombol filter. */
  filterLabel: string;
  badge: string;
  dot: string;
  icon: "check" | "warning" | "expired" | "paused";
}

export const EXPIRY_META: Record<ExpiryGroup, GroupMeta> = {
  safe: {
    label: "Aktif",
    filterLabel: "Masih lama",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    icon: "check",
  },
  warning: {
    label: "Segera bayar",
    filterLabel: "Hampir jatuh tempo",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    icon: "warning",
  },
  expired: {
    label: "Kedaluwarsa",
    filterLabel: "Kedaluwarsa",
    badge: "bg-red-100 text-red-600",
    dot: "bg-red-500",
    icon: "expired",
  },
  inactive: {
    label: "Belum aktif",
    filterLabel: "Belum aktif",
    badge: "bg-ink-900/10 text-ink-500",
    dot: "bg-ink-400",
    icon: "paused",
  },
};

export const EXPIRY_ORDER: ExpiryGroup[] = ["safe", "warning", "expired", "inactive"];

function Icon({ name }: { name: GroupMeta["icon"] }) {
  const common = {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    className: "h-3.5 w-3.5 shrink-0",
    "aria-hidden": true,
  } as const;

  if (name === "warning") {
    return (
      <svg {...common}>
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.515 2.63H3.72c-1.345 0-2.188-1.463-1.515-2.63L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 7.5a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common}>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (name === "expired") {
    return (
      <svg {...common}>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Selisih hari (UTC) dari hari ini ke `endDate`; negatif = sudah lewat. */
export function daysUntil(endDate: string): number {
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const end = new Date(endDate.slice(0, 10)).getTime();
  return Math.round((end - today) / 86_400_000);
}

/** Keterangan sisa waktu: "3 hari lagi", "hari ini", "lewat 5 hari". */
export function remainingText(endDate: string): string {
  const d = daysUntil(endDate);
  if (d === 0) return "jatuh tempo hari ini";
  return d > 0 ? `${d} hari lagi` : `lewat ${Math.abs(d)} hari`;
}

/**
 * Badge status masa berlaku. Ikon peringatan kuning muncul saat `warning`,
 * hijau saat masih lama, merah saat kedaluwarsa, abu-abu saat belum aktif.
 */
export function ExpiryBadge({
  group,
  endDate,
}: {
  group: ExpiryGroup;
  endDate?: string;
}) {
  const meta = EXPIRY_META[group] ?? EXPIRY_META.inactive;
  const showDays = endDate && group !== "inactive";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}
      title={endDate ? `Berakhir ${endDate.slice(0, 10)} · ${remainingText(endDate)}` : meta.label}
    >
      <Icon name={meta.icon} />
      {meta.label}
      {showDays && <span className="font-normal opacity-80">· {remainingText(endDate)}</span>}
    </span>
  );
}

/**
 * Filter pengelompokan warna. `value` undefined = semua.
 * `counts` opsional — jumlah baris per kelompok pada data yang sedang tampil.
 */
export function ExpiryFilter({
  value,
  onChange,
  counts,
}: {
  value?: ExpiryGroup;
  onChange: (g?: ExpiryGroup) => void;
  counts?: Partial<Record<ExpiryGroup, number>>;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-ink-900/10 p-1">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
          !value ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
        }`}
      >
        Semua
      </button>
      {EXPIRY_ORDER.map((g) => {
        const meta = EXPIRY_META[g];
        const active = value === g;
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-4 focus-visible:ring-neon-purple/30 ${
              active ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />
            {meta.filterLabel}
            {counts?.[g] !== undefined && (
              <span className={active ? "opacity-70" : "text-ink-400"}>{counts[g]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Kolom "Subject" — nama panggilan akun pemilik, dengan nama lengkap +
 * email sebagai baris bantuan. Akun lama yang belum mengisi nama panggilan
 * jatuh kembali ke nama lengkap.
 */
export function SubjectCell({ u }: { u?: AdminUserRef | null }) {
  if (!u) return <span className="text-ink-400">—</span>;
  const subject = u.nickname?.trim() || u.full_name;
  return (
    <div className="min-w-0">
      <p className="font-medium text-ink-900">{subject}</p>
      <p className="truncate text-xs text-ink-400">
        {u.nickname?.trim() ? `${u.full_name} · ` : ""}
        {u.email}
      </p>
    </div>
  );
}
