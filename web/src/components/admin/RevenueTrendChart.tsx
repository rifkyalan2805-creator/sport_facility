"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatRupiah, formatDateID, shortRupiah, shortDayMonth } from "@/lib/format";
import type { RevenueTrendPoint } from "@/lib/queries";

// Palet brand tervalidasi (dataviz): purple vs pink lolos pemisahan CVD (ΔE 51.9).
const BAR = "#8b5cf6"; // neon.purple — revenue harian
const LINE = "#ff2d92"; // neon.pink — total kumulatif

/**
 * Combo chart tren revenue: bar = revenue harian, line = total kumulatif.
 * Satu sumbu-Y (keduanya Rupiah) — sengaja BUKAN dual-axis: dua skala-Y adalah
 * anti-pattern chart #1. Kumulatif dihitung di frontend dari `trend`.
 */
export default function RevenueTrendChart({ data }: { data: RevenueTrendPoint[] }) {
  let run = 0;
  const rows = data.map((p) => {
    run += p.revenue;
    return { date: p.date, revenue: p.revenue, cumulative: run };
  });

  if (rows.every((r) => r.revenue === 0)) {
    return (
      <div className="flex h-72 w-full items-center justify-center text-sm text-ink-400">
        Belum ada transaksi pada periode ini.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDayMonth}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={shortRupiah}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            labelFormatter={(l) => formatDateID(String(l))}
            formatter={(value, name) => [formatRupiah(Number(value)), name]}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar
            dataKey="revenue"
            name="Revenue harian"
            fill={BAR}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            name="Total kumulatif"
            stroke={LINE}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
