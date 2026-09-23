"use client";

import { useRef, useState } from "react";
import { apiUpload } from "@/lib/api";
import { assetUrl } from "@/lib/asset";
import { getErrorMessage } from "@/lib/error";

/**
 * Bentuk pratinjau — sekaligus rasio yang dipakai saat gambar tampil nanti,
 * supaya admin/user langsung lihat bagian mana yang terpotong object-cover.
 * "wide" = 16:9, lebar penuh (cover berita/banner).
 */
export type PhotoShape = "square" | "round" | "wide";

/** Orientasi berkas yang baru diunggah — dipakai pemanggil untuk menyarankan tata letak. */
export type PhotoOrientation = "portrait" | "landscape";

interface PhotoUploadProps {
  value?: string | null; // photo_url tersimpan (URL Supabase, atau "/uploads/..." utk data lama)
  /**
   * `orientation` diturunkan dari dimensi asli berkasnya — gratis, karena
   * gambar memang sudah dimuat untuk diperkecil. Pemanggil bebas mengabaikannya.
   */
  onChange: (url: string, orientation?: PhotoOrientation) => void;
  invalid?: boolean;
  /** Endpoint unggah — menentukan bucket tujuan di Supabase Storage. */
  endpoint?: string;
  shape?: PhotoShape;
  /**
   * Sisi terpanjang hasil downscale di browser (px). Default 600 cukup untuk
   * foto orang; gambar konten yang tampil besar perlu lebih (lihat pemanggil).
   */
  max?: number;
  alt?: string;
  hint?: string;
}

/** Muat gambar dari File → HTMLImageElement. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("File bukan gambar yang valid"));
    };
    img.src = url;
  });
}

/**
 * Gambar dianggap potret hanya kalau JELAS lebih tinggi — 10% ambang supaya
 * gambar nyaris persegi (mis. 1000×1010) tidak ikut terlempar ke tata letak
 * potret, yang justru membuatnya tampak sempit.
 */
function orientationOf(width: number, height: number): PhotoOrientation {
  return height > width * 1.1 ? "portrait" : "landscape";
}

/**
 * Downscale ke maks 600px (jaga rasio) → JPEG kualitas 0.8.
 * Orientasi dibaca dari dimensi ASLI berkas, sebelum diperkecil.
 */
async function downscale(
  file: File,
  max = 600,
  quality = 0.8,
): Promise<{ blob: Blob; orientation: PhotoOrientation }> {
  const img = await loadImage(file);
  const orientation = orientationOf(img.width, img.height);
  let { width, height } = img;
  if (width > max || height > max) {
    const scale = Math.min(max / width, max / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung browser");
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar"))),
      "image/jpeg",
      quality,
    ),
  );
  return { blob, orientation };
}

/**
 * Pemilih + pengunggah foto. Gambar diperkecil di browser sebelum dikirim
 * (hemat kuota & selalu di bawah batas 2 MB backend), lalu diunggah ke
 * Supabase Storage. Yang dikembalikan ke `onChange` adalah URL publik absolut
 * — penyimpanannya ke database jadi tanggung jawab pemanggil.
 */
export default function PhotoUpload({
  value,
  onChange,
  invalid,
  endpoint = "/uploads/member-photo",
  shape = "square",
  max = 600,
  alt = "Foto member",
  hint = "JPG/PNG/WebP, akan diperkecil otomatis.",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = assetUrl(value);
  const wide = shape === "wide";

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // izinkan pilih file yang sama lagi
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const { blob, orientation } = await downscale(file, max);
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");
      const { url } = await apiUpload<{ url: string }>(endpoint, form);
      onChange(url, orientation);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengunggah foto"));
    } finally {
      setBusy(false);
    }
  }

  const frame = (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border bg-ink-900/5 ${
        wide ? "aspect-[16/9] w-full rounded-2xl" : "h-24 w-24"
      } ${shape === "round" ? "rounded-full" : wide ? "" : "rounded-2xl"} ${
        invalid ? "border-red-400" : "border-ink-900/15"
      }`}
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={alt}
          /* `wide` dipakai gambar konten yang nanti tampil UTUH, jadi
             pratinjaunya ikut `contain` — kalau `cover`, admin melihat
             potongan yang sebenarnya tidak pernah terjadi. Foto profil &
             member card memang dipotong saat tampil, jadi tetap `cover`. */
          className={`h-full w-full ${wide ? "object-contain" : "object-cover"}`}
        />
      ) : (
        <span className="text-xs text-ink-400">{wide ? "Belum ada gambar" : "Foto"}</span>
      )}
    </div>
  );

  const control = (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-full border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-700 outline-none transition-colors hover:bg-ink-900/5 disabled:opacity-50"
      >
        {busy ? "Mengunggah…" : `${preview ? "Ganti" : "Unggah"} ${wide ? "gambar" : "foto"}`}
      </button>
      <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );

  return (
    <div>
      {/* Pratinjau lebar ditumpuk di atas tombol; yang kecil tetap berdampingan. */}
      {wide ? (
        <div className="space-y-3">
          {frame}
          {control}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {frame}
          {control}
        </div>
      )}
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
