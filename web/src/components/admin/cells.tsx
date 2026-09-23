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

/** Pratinjau gambar 16:9 untuk kolom tabel — kecil, tidak menggeser tinggi baris. */
export function thumb(url: string | null | undefined, alt = "") {
  if (!url) {
    return <span className="inline-flex h-9 w-16 items-center justify-center rounded-md bg-ink-900/[0.06] text-[10px] text-ink-400">—</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={encodeURI(url)}
      alt={alt}
      loading="lazy"
      className="h-9 w-16 rounded-md border border-ink-900/10 object-cover"
    />
  );
}

export function pill(text: string) {
  return (
    <span className="inline-flex rounded-full bg-ink-900/[0.06] px-2 py-0.5 text-xs font-medium capitalize text-ink-600">
      {text}
    </span>
  );
}
