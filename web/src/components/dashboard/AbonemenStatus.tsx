"use client";

import Link from "next/link";
import { useMyAbonemenRegistrations, type AbonemenRegistration } from "@/lib/queries";
import { formatDateID, formatRupiah } from "@/lib/format";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/dashboard/common";

const STATUS: Record<AbonemenRegistration["status"], { label: string; cls: string }> = {
  pending: { label: "Menunggu ditinjau", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Disetujui", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Ditolak", cls: "bg-red-100 text-red-600" },
  cancelled: { label: "Dibatalkan", cls: "bg-ink-900/10 text-ink-700" },
};

const DAFTAR_HREF = "/harga/tenis/abonemen/registration";

/**
 * Ringkasan hak keanggotaan abonemen.
 *
 * Aturan "disetujui" DISAMAKAN dengan gating di TennisWizard dan di
 * booking.service.ts (`findApprovedForUser`): satu registrasi berstatus
 * approved sudah cukup. Kalau aturan di sana berubah, ubah juga di sini —
 * kalau tidak, dashboard menjanjikan tarif yang ditolak saat booking.
 */
export function AbonemenStatusBanner() {
  const { data = [], isLoading, isError } = useMyAbonemenRegistrations();

  if (isLoading) return <ListSkeleton rows={1} />;
  if (isError) return <ErrorState>Gagal memuat status abonemen.</ErrorState>;

  const disetujui = data.some((r) => r.status === "approved");
  const menunggu = data.some((r) => r.status === "pending");

  if (disetujui) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-2">
          <Badge label="Disetujui" cls="bg-green-100 text-green-700" />
          <p className="font-semibold text-green-900">Keanggotaan abonemen aktif</p>
        </div>
        <p className="mt-2 text-sm text-green-800">
          Kamu berhak memakai <strong>tarif abonemen</strong> untuk lapangan tenis — lebih murah
          dari tarif insidentil, dibayar per jam seperti biasa.
        </p>
        <Link
          href="/booking/tennis"
          className="mt-4 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neon-pink"
        >
          Booking dengan Tarif Abonemen
        </Link>
      </div>
    );
  }

  if (menunggu) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2">
          <Badge label="Menunggu ditinjau" cls="bg-amber-100 text-amber-700" />
          <p className="font-semibold text-amber-900">Pengajuan sedang diproses</p>
        </div>
        <p className="mt-2 text-sm text-amber-800">
          Staf akan meninjau pengajuanmu. Setelah disetujui, tarif abonemen tenis otomatis
          terbuka saat booking.
        </p>
      </div>
    );
  }

  return (
    <EmptyState
      text="Belum punya keanggotaan abonemen tenis. Ajukan untuk membuka tarif yang lebih murah."
      ctaHref={DAFTAR_HREF}
      ctaLabel="Ajukan Abonemen"
    />
  );
}

/**
 * Riwayat pengajuan — termasuk catatan staf saat ditolak.
 * Kartunya menyembunyikan diri saat belum ada pengajuan: banner di atas sudah
 * mengajak mendaftar, jadi kartu kosong hanya mengulang ajakan yang sama.
 */
export function AbonemenHistoryCard() {
  const { data = [], isLoading, isError } = useMyAbonemenRegistrations();
  if (isLoading || isError || data.length === 0) return null;

  return (
    <Card title="Riwayat Pengajuan">
      <ul className="space-y-3">
        {data.map((r) => {
          const s = STATUS[r.status] ?? STATUS.pending;
          return (
            <li key={r.id} className="rounded-2xl border border-ink-900/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink-900">
                      {r.abonemen_packages?.name ?? "Paket Abonemen"}
                    </p>
                    <Badge label={s.label} cls={s.cls} />
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    Diajukan {formatDateID(r.created_at)}
                    {r.reviewed_at && <> · ditinjau {formatDateID(r.reviewed_at)}</>}
                  </p>
                </div>
                {r.abonemen_packages && (
                  <p className="text-sm font-semibold text-ink-900">
                    {formatRupiah(r.abonemen_packages.price)}
                  </p>
                )}
              </div>
              {r.notes && (
                <p className="mt-3 rounded-xl bg-ink-900/[0.03] px-4 py-3 text-sm text-ink-600">
                  <span className="font-medium text-ink-900">Catatan staf:</span> {r.notes}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
