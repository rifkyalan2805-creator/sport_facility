"use client";

import { useRef, useState } from "react";
import { apiUpload } from "@/lib/api";
import { assetUrl } from "@/lib/asset";
import { getErrorMessage } from "@/lib/error";

interface PhotoUploadProps {
  value?: string | null; // photo_url tersimpan (URL Supabase, atau "/uploads/..." utk data lama)
  onChange: (url: string) => void;
  invalid?: boolean;
  /** Endpoint unggah — menentukan bucket tujuan di Supabase Storage. */
  endpoint?: string;
  /** Tampilkan pratinjau bulat (foto profil) alih-alih kotak (member card). */
  round?: boolean;
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

/** Downscale ke maks 600px (jaga rasio) → JPEG kualitas 0.8. */
async function downscale(file: File, max = 600, quality = 0.8): Promise<Blob> {
  const img = await loadImage(file);
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
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar"))),
      "image/jpeg",
      quality,
    ),
  );
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
  round = false,
  alt = "Foto member",
  hint = "JPG/PNG/WebP, akan diperkecil otomatis.",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = assetUrl(value);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // izinkan pilih file yang sama lagi
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const blob = await downscale(file);
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");
      const { url } = await apiUpload<{ url: string }>(endpoint, form);
      onChange(url);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal mengunggah foto"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border ${
            round ? "rounded-full" : "rounded-2xl"
          } ${invalid ? "border-red-400" : "border-ink-900/15"} bg-ink-900/5`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-ink-400">Foto</span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-full border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-700 outline-none transition-colors hover:bg-ink-900/5 disabled:opacity-50"
          >
            {busy ? "Mengunggah…" : preview ? "Ganti foto" : "Unggah foto"}
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
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
