// Resolusi URL aset statis backend (mis. foto member "/uploads/...").
// File disajikan di origin API tanpa prefix /api/v1.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

/** Ubah path relatif upload → URL absolut. URL absolut dibiarkan apa adanya. */
export function assetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
