"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";
import { KANAL, type Kanal } from "@/lib/contact";
import { copyText } from "@/lib/clipboard";
import { CheckIcon, CopyIcon, KanalIcon } from "./icons";

/**
 * Daftar kanal yang bisa dihubungi.
 *
 * Tiap kartu punya dua aksi: membuka kanalnya, dan menyalin nilainya. Tombol
 * salin ada karena tidak semua pengunjung membuka situs ini di perangkat yang
 * sama dengan tempat mereka memakai WhatsApp — menyalin nomor jauh lebih cepat
 * daripada menyalinnya ulang dengan tangan dan berisiko salah satu digit.
 *
 * Kartu di sini sengaja tidak memakai tombol berisi warna: satu-satunya isian
 * gradient di halaman kontak dipesan untuk tombol kirim pada formulir, sesuai
 * aturan satu gradient per tampilan.
 */

/** Berapa lama keadaan "Tersalin" bertahan sebelum kembali ke label semula. */
const SALIN_RESET_MS = 2000;

function KanalCard({ kanal }: { kanal: Kanal }) {
  const [status, setStatus] = useState<"idle" | "ok" | "gagal">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tanpa ini, setTimeout yang masih berjalan akan memanggil setState pada
  // komponen yang sudah dilepas ketika pengunjung berpindah halaman.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function onSalin() {
    const ok = await copyText(kanal.copy);
    setStatus(ok ? "ok" : "gagal");

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), SALIN_RESET_MS);
  }

  const label =
    status === "ok" ? "Tersalin" : status === "gagal" ? "Gagal menyalin" : "Salin";

  return (
    <div
      className={`${REVEAL_TEXT} flex flex-col rounded-xl border border-obsidian/10 bg-paper-white p-7`}
    >
      <KanalIcon id={kanal.id} className="h-5 w-5 text-obsidian/35" />

      <p className="mt-6 font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
        {kanal.label}
      </p>

      <a
        href={kanal.href}
        {...(kanal.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="mt-2 break-words font-display text-base font-semibold tracking-tight text-obsidian underline decoration-obsidian/25 underline-offset-4 outline-none transition-colors duration-200 hover:decoration-obsidian focus-visible:decoration-obsidian"
      >
        {kanal.value}
      </a>

      {/* `mt-auto` menjaga tombol tetap rata bawah antar kartu meski nilainya
          memanjang jadi dua baris — alamat email jauh lebih panjang daripada
          nama akun Instagram. */}
      <div className="mt-auto pt-7">
        <button
          type="button"
          onClick={onSalin}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-obsidian/15 px-4 py-2 font-condensed text-[11px] font-semibold uppercase tracking-eyebrow text-obsidian outline-none transition-colors duration-200 hover:border-obsidian/40 hover:bg-obsidian/[0.03] focus-visible:ring-4 focus-visible:ring-obsidian/20"
        >
          {status === "ok" ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5" />
          )}
          {/* Label tombol ikut berubah, jadi cukup satu wilayah sopan yang
              membacakan hasilnya — tanpa ini pengguna pembaca layar tidak tahu
              apakah penyalinan berhasil. */}
          <span aria-live="polite">{label}</span>
          <span className="sr-only">
            {" "}
            {kanal.label} {kanal.value}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function ChannelGrid() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section
      ref={root}
      id="kanal"
      className="bg-paper-white px-6 py-24 md:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <div className={REVEAL_TEXT}>
            <Eyebrow>Cara Menghubungi</Eyebrow>
          </div>
          <h2
            className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
          >
            Pilih jalur yang
            <br />
            paling cepat.
          </h2>
          <p
            className={`${REVEAL_TEXT} mt-7 font-display text-base leading-relaxed text-graphite`}
          >
            Empat kanal, satu tim yang sama di baliknya. Untuk pertanyaan soal
            jam dan ketersediaan lapangan, pesan singkat lewat WhatsApp hampir
            selalu jadi yang tercepat.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {KANAL.map((k) => (
            <KanalCard key={k.id} kanal={k} />
          ))}
        </div>
      </div>
    </section>
  );
}
