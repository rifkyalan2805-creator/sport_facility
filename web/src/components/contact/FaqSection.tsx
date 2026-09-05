"use client";

import { useRef } from "react";
import Button, { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";
import { FAQ } from "@/lib/contact";
import { ChevronIcon } from "./icons";

/**
 * Pertanyaan yang sering diajukan.
 *
 * Accordion memakai `<details>`/`<summary>` bawaan peramban, bukan komponen
 * buatan sendiri: keadaan buka-tutup, peran ARIA, navigasi Tab, dan Enter/Space
 * sudah benar tanpa satu baris JavaScript pun — termasuk saat JS gagal dimuat.
 * Yang kita tambahkan hanya penyembunyian segitiga bawaan dan rotasi chevron.
 *
 * Isi daftarnya ada di `lib/contact.ts`.
 */
export default function FaqSection() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section ref={root} id="faq" className="bg-cloud-gray px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* ---- Pengantar ---- */}
          <div>
            <div className={REVEAL_TEXT}>
              <Eyebrow>Pertanyaan Umum</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
            >
              Dijawab lebih
              <br />
              dulu di sini.
            </h2>
            <p
              className={`${REVEAL_TEXT} mt-7 max-w-md font-display text-base leading-relaxed text-graphite`}
            >
              Delapan hal yang paling sering ditanyakan sebelum orang datang
              pertama kali. Kalau yang Anda cari tidak ada di daftar ini,
              kirimkan pertanyaannya — kami jawab langsung.
            </p>

            <div className={`${REVEAL_TEXT} mt-9`}>
              <Button href="#pesan" variant="obsidian">
                Tanya Langsung
              </Button>
            </div>
          </div>

          {/* ---- Daftar ---- */}
          <div className={`${REVEAL_TEXT} border-t border-obsidian/10`}>
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-obsidian/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-6 outline-none transition-colors duration-200 hover:text-obsidian/70 focus-visible:ring-4 focus-visible:ring-obsidian/20 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-base font-semibold leading-snug tracking-tight text-obsidian sm:text-lg">
                    {item.q}
                  </span>
                  <ChevronIcon className="h-4 w-4 shrink-0 text-obsidian/40 transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="max-w-2xl pb-7 pr-6 font-display text-[15px] leading-relaxed text-graphite">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
