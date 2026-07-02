"use client";

import Link from "next/link";
import { useCourts, type Court } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

const typeGradient: Record<string, string> = {
  paddle: "from-neon-blue to-neon-purple",
  tennis: "from-neon-purple to-neon-pink",
};

function CourtCard({ court }: { court: Court }) {
  const grad = typeGradient[court.type] ?? "from-ink-500 to-ink-700";
  return (
    <article className="overflow-hidden rounded-2xl border border-ink-900/10 bg-white transition-shadow duration-200 hover:shadow-lg hover:shadow-ink-900/5">
      <div className={`relative h-28 bg-gradient-to-br ${grad}`}>
        <span className="absolute bottom-3 left-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
          {court.type}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-ink-900">{court.name}</h3>
        <p className="mt-1 text-sm text-ink-400">
          {court.is_indoor ? "Indoor" : "Outdoor"} · Kode {court.code}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-base font-semibold text-ink-900">
            {formatRupiah(court.price_per_hour)}
            <span className="text-sm font-normal text-ink-400"> /jam</span>
          </span>
          <Link
            href="/register"
            className="cursor-pointer rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink-700"
          >
            Booking
          </Link>
        </div>
      </div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-ink-900/10">
          <div className="h-28 animate-pulse bg-ink-900/10" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-ink-900/10" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-ink-900/10" />
            <div className="h-9 w-full animate-pulse rounded bg-ink-900/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourtsSection() {
  const { data, isLoading, isError } = useCourts();

  return (
    <section id="lapangan" className="bg-white px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
            Lapangan
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            Lapangan siap <span className="text-gradient-neon">kamu booking</span>
          </h2>
          <p className="mt-4 text-base text-ink-500">
            Data diambil langsung dari sistem kami secara real-time.
          </p>
        </div>

        <div className="mt-12">
          {isLoading && <Skeleton />}
          {isError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              Gagal memuat lapangan. Pastikan server backend aktif di port 3000.
            </p>
          )}
          {data && data.length === 0 && (
            <p className="text-sm text-ink-400">Belum ada lapangan tersedia.</p>
          )}
          {data && data.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((c) => (
                <CourtCard key={c.id} court={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
