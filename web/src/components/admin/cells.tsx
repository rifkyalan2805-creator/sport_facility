import { formatRupiah } from "@/lib/format";

export function money(v: string | number) {
  return formatRupiah(v);
}

export function boolBadge(v: boolean, on = "Aktif", off = "Nonaktif") {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        v ? "bg-green-100 text-green-700" : "bg-ink-900/10 text-ink-500"
      }`}
    >
      {v ? on : off}
    </span>
  );
}

export function pill(text: string) {
  return (
    <span className="inline-flex rounded-full bg-ink-900/[0.06] px-2 py-0.5 text-xs font-medium capitalize text-ink-600">
      {text}
    </span>
  );
}
