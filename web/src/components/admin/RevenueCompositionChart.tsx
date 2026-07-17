"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatRupiah } from "@/lib/format";
import type { RevenueCompositionSlice } from "@/lib/queries";

// Palet kategori tervalidasi (dataviz reference, mode light, worst ΔE 24.2).
// Warna mengikuti ENTITAS (label), bukan peringkat/besaran — jadi tidak repaint
// saat periode diganti. "Lainnya" selalu netral (abu-abu), konvensi "Other".
const SLICES = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"];
const OTHER = "#86868b"; // ink.300
const FIXED: Record<string, string> = {
  Padel: "#2a78d6",
  Tennis: "#1baf7a",
  Kolam: "#eda100",
  Abonemen: "#008300",
  Membership: "#4a3aa7",
  Event: "#e34948",
  Badminton: "#e87ba4",
  "Tiket Masuk": "#eb6834",
};

function colorFor(label: string): string {
  if (label === "Lainnya") return OTHER;
  if (FIXED[label]) return FIXED[label];
  // Kategori tak terdaftar (mis. Basket/Futsal/Retail): stabil per-label, bukan per-rank.
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return SLICES[h % SLICES.length];
}

export default function RevenueCompositionChart({
  data,
  total,
}: {
  data: RevenueCompositionSlice[];
  total: number;
}) {
  if (!data.length || total === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-ink-400">
        Belum ada transaksi pada periode ini.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="relative h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((s) => (
                  <Cell key={s.label} fill={colorFor(s.label)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => [
                  `${formatRupiah(Number(value))} · ${item?.payload?.pct ?? 0}%`,
                  item?.payload?.label,
                ]}
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Total di tengah donut — overlay agar posisi selalu tepat & responsif.
              max-w membatasi teks di dalam lubang donut supaya angka besar membungkus,
              bukan menimpa cincin. */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-ink-400">Total</span>
            <span className="max-w-[7rem] text-sm font-semibold leading-tight text-ink-900">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Legend = sekaligus rincian: warna + label + persen + nominal */}
        <ul className="space-y-2">
          {data.map((s) => (
            <li key={s.label} className="flex items-center gap-3 text-sm">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-[3px]"
                style={{ backgroundColor: colorFor(s.label) }}
              />
              <span className="text-ink-700">{s.label}</span>
              <span className="ml-auto tabular-nums text-ink-500">
                {s.pct}% · {formatRupiah(s.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-ink-400">
        Berdasarkan nilai item · dari pembayaran lunas
      </p>
    </div>
  );
}
