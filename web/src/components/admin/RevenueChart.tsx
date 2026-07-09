"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatRupiah } from "@/lib/format";

interface Point {
  date: string;
  revenue: number;
  count: number;
}

const shortDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const shortRp = (v: number) =>
  v >= 1_000_000 ? `${v / 1_000_000}jt` : v >= 1_000 ? `${Math.round(v / 1000)}rb` : `${v}`;

export default function RevenueChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={shortRp}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            formatter={(value) => [formatRupiah(Number(value)), "Revenue"]}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", fontSize: 13 }}
          />
          <Bar dataKey="revenue" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
