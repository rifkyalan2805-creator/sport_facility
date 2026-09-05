"use client";

import { useMyAbonemen, type AbonemenExpiryGroup, type MyAbonemen } from "@/lib/queries";
import { formatDateID, formatRupiah } from "@/lib/format";
import { Badge, Card, sisaBerlaku } from "@/components/dashboard/common";

// Warna mengikuti expiry_group dari backend (src/utils/expiry.ts) supaya badge
// di sini dan di panel admin tidak pernah berbeda pendapat soal "hampir habis".
const GROUP: Record<AbonemenExpiryGroup, { label: string; cls: string; bar: string }> = {
  safe: { label: "Aktif", cls: "bg-green-100 text-green-700", bar: "bg-green-500" },
  warning: { label: "Segera berakhir", cls: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
  expired: { label: "Kadaluarsa", cls: "bg-red-100 text-red-600", bar: "bg-red-500" },
  inactive: { label: "Tidak aktif", cls: "bg-ink-900/10 text-ink-700", bar: "bg-ink-400" },
};

function PaketCard({ a }: { a: MyAbonemen }) {
  const g = GROUP[a.expiry_group] ?? GROUP.inactive;
  const total = a.total_sessions;
  // Tanpa total (paket terhapus) progress bar tidak punya penyebut yang jujur,
  // jadi bar-nya disembunyikan dan hanya angka sisa yang ditampilkan.
  const persen =
    total && total > 0 ? Math.max(0, Math.min(100, (a.remaining_sessions / total) * 100)) : null;

  return (
    <li className="rounded-2xl border border-ink-900/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-ink-900">
              {a.abonemen_packages?.name ?? "Paket Abonemen"}
            </p>
            <Badge label={g.label} cls={g.cls} />
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {formatDateID(a.start_date)} – {formatDateID(a.end_date)}
            <span className="ml-1 text-ink-400">· {sisaBerlaku(a.end_date)}</span>
          </p>
        </div>
        {a.abonemen_packages && (
          <p className="text-sm font-semibold text-ink-900">
            {formatRupiah(a.abonemen_packages.price)}
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink-500">Sisa sesi</span>
          <span className="font-semibold text-ink-900">
            {a.remaining_sessions}
            {total ? <span className="font-normal text-ink-400"> dari {total}</span> : null}
          </span>
        </div>
        {persen !== null && (
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-ink-900/10"
            role="progressbar"
            aria-valuenow={a.remaining_sessions}
            aria-valuemin={0}
            aria-valuemax={total ?? undefined}
            aria-label="Sisa sesi abonemen"
          >
            <div className={`h-full rounded-full ${g.bar}`} style={{ width: `${persen}%` }} />
          </div>
        )}
        {a.abonemen_packages && (
          <p className="mt-2 text-xs text-ink-400">
            {a.abonemen_packages.sessions_per_week}× per minggu ·{" "}
            {a.abonemen_packages.duration_weeks} minggu
          </p>
        )}
      </div>

      {a.notes && <p className="mt-3 text-sm text-ink-500">{a.notes}</p>}
    </li>
  );
}

/**
 * Kartu paket prabayar (`user_abonemen`) — kuota sesi yang dibayar di muka.
 *
 * SENGAJA tidak dirender sama sekali kalau user tidak punya paket: model
 * abonemen yang berjalan di sini adalah "approved → berhak tarif tenis lebih
 * murah per jam" (lihat gating di booking.service.ts), sedangkan paket prabayar
 * bersifat opsional dan belum dijual di mana pun. Menampilkan kartu kosong
 * berisi ajakan "Ajukan Abonemen" akan menyuruh anggota yang SUDAH disetujui
 * untuk mendaftar lagi.
 *
 * Loading & error juga menghasilkan null: kartu ini pada umumnya memang absen,
 * jadi menampilkan skeleton/kotak merah untuk fitur yang tidak dipakai hanya
 * menambah keriuhan tanpa ada yang bisa ditindaklanjuti user.
 */
export default function AbonemenPackagesCard({ limit }: { limit?: number }) {
  const { data = [], isLoading, isError } = useMyAbonemen();
  if (isLoading || isError || data.length === 0) return null;

  const rows = limit ? data.slice(0, limit) : data;
  return (
    <Card title="Paket Prabayar">
      <ul className="space-y-3">
        {rows.map((a) => (
          <PaketCard key={a.id} a={a} />
        ))}
      </ul>
    </Card>
  );
}
