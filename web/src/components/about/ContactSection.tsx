"use client";

import Link from "next/link";
import { useRef } from "react";
import Button, { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";
import { JAM_OPERASIONAL, KANAL, LOKASI } from "@/lib/contact";

/**
 * Section 4 — ajakan bertanya.
 *
 * Versi ringkas. Sejak halaman /kontak ada, seluruh isi lengkap — formulir,
 * daftar topik, FAQ — tinggal di sana; yang tersisa di sini hanya kanal yang
 * bisa langsung diklik plus satu pintu menuju halaman itu. Dua halaman yang
 * memuat hal yang sama persis hanya membuat pengunjung ragu harus membaca
 * yang mana.
 *
 * Nilai kanal, alamat, dan jam buka datang dari `lib/contact.ts` — satu-satunya
 * tempat data tersebut ditulis.
 */
export default function ContactSection() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section ref={root} id="kontak" className="bg-paper-white px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* ---- Ajakan ---- */}
          <div>
            <div className={REVEAL_TEXT}>
              <Eyebrow>Kontak Kami</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
            >
              Ada yang ingin
              <br />
              ditanyakan?
            </h2>
            <p
              className={`${REVEAL_TEXT} mt-7 max-w-xl font-display text-lg leading-relaxed text-obsidian/80`}
            >
              Jangan ragu menghubungi kami. Informasi terbaru soal jadwal,
              ketersediaan lapangan, perubahan jam operasional, sampai turnamen
              dan kelas yang akan datang paling cepat sampai lewat pesan
              langsung — dan pertanyaan Anda kami balas pada jam operasional.
            </p>

            <div className={`${REVEAL_TEXT} mt-10 flex flex-col gap-3 sm:flex-row`}>
              <Button href="/kontak" variant="obsidian" size="lg">
                Semua Kanal &amp; Formulir
              </Button>
              <Button href="/harga" variant="ghost" size="lg">
                Cek Daftar Harga
              </Button>
            </div>
          </div>

          {/* ---- Kanal ---- */}
          <div className={REVEAL_TEXT}>
            <dl className="grid grid-cols-1 gap-px border-t border-obsidian/10 sm:grid-cols-2">
              {KANAL.map((k) => (
                <div
                  key={k.label}
                  className="border-b border-obsidian/10 py-7 sm:even:border-l sm:even:pl-8 sm:odd:pr-8"
                >
                  <dt className="font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                    {k.label}
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={k.href}
                      {...(k.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="break-words font-display text-base font-semibold tracking-tight text-obsidian underline decoration-obsidian/25 underline-offset-4 outline-none transition-colors duration-200 hover:decoration-obsidian focus-visible:decoration-obsidian"
                    >
                      {k.value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 rounded-xl border border-obsidian/10 bg-cloud-gray/60 p-7">
              <p className="font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                Jam Operasional
              </p>
              <p className="mt-2 font-display text-base font-semibold tracking-tight text-obsidian">
                {JAM_OPERASIONAL}
              </p>

              <p className="mt-6 font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                Datang Langsung
              </p>
              <p className="mt-2 font-display text-sm leading-relaxed text-graphite">
                {LOKASI.alamatRingkas}{" "}
                <Link
                  href="#lokasi"
                  className="font-semibold text-obsidian underline decoration-obsidian/30 underline-offset-4 outline-none transition-colors duration-200 hover:decoration-obsidian focus-visible:decoration-obsidian"
                >
                  Lihat peta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
