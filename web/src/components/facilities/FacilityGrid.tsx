"use client";

import { useRef, type ComponentType } from "react";
import { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";
import {
  FirstAidIcon,
  GazeboIcon,
  MosqueIcon,
  ParkingIcon,
  ShowerIcon,
  SoapIcon,
} from "./icons";

/**
 * Kisi fasilitas pendukung.
 *
 * Kartu sengaja BUKAN tautan: tidak ada halaman rinci untuk kamar mandi atau
 * musholla, jadi memasang panah "lihat detail" hanya akan menjanjikan tujuan
 * yang tidak ada. Sbg gantinya baris bawah memuat keterangan cakupan
 * (mis. "khusus area kolam") yang memang berguna dibaca.
 *
 * Interaksi hover mengikuti permintaan: begitu kursor menyentuh kartu — ikon
 * termasuk — kotak ikon terisi abu-abu (`cloud-gray`) dan garis aksen tumbuh
 * dari kiri di tepi bawah kartu. Semuanya CSS murni lewat `group-hover`, jadi
 * tidak ada JS yang berjalan saat hover.
 */

interface Facility {
  id: string;
  title: string;
  desc: string;
  /** Keterangan cakupan — muncul di baris bawah kartu. */
  meta: string;
  Icon: ComponentType<{ className?: string }>;
}

const FACILITIES: Facility[] = [
  {
    id: "kamar-mandi",
    title: "Kamar Mandi Air Panas",
    desc: "Bilik bilas tertutup dengan keran pengatur suhu, air panas tersedia sepanjang jam operasional.",
    meta: "Semua area",
    Icon: ShowerIcon,
  },
  {
    id: "sabun-shampoo",
    title: "Sabun & Shampoo",
    desc: "Sabun dan shampoo disediakan di setiap bilik bilas dan diperiksa petugas setiap hari.",
    meta: "Diisi ulang harian",
    Icon: SoapIcon,
  },
  {
    id: "musholla",
    title: "Musholla",
    desc: "Ruang salat dengan mukena, sajadah, dan tempat wudu terpisah untuk jamaah pria dan wanita.",
    meta: "Dekat lobi utama",
    Icon: MosqueIcon,
  },
  {
    id: "parkir",
    title: "Parkir Luas",
    desc: "Area parkir menampung kendaraan roda empat dan roda dua tanpa perlu antre di jam ramai.",
    meta: "Roda dua & roda empat",
    Icon: ParkingIcon,
  },
  {
    id: "gazebo",
    title: "Gazebo Tepi Kolam",
    desc: "Tempat berteduh khusus pengunjung kolam renang — untuk beristirahat antar sesi atau menunggu keluarga.",
    meta: "Khusus area kolam",
    Icon: GazeboIcon,
  },
  {
    id: "p3k",
    title: "Pertolongan Pertama",
    desc: "Kotak P3K di setiap zona dan petugas yang siap menangani cedera ringan selama jam buka.",
    meta: "Siaga saat jam buka",
    Icon: FirstAidIcon,
  },
];

export default function FacilityGrid() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section id="daftar-fasilitas" ref={root} className="bg-cloud-gray px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="max-w-2xl">
          <div className={REVEAL_TEXT}>
            <Eyebrow>Fasilitas Pendukung</Eyebrow>
          </div>
          <h2
            className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
          >
            Enam hal kecil
            <br />
            yang menentukan.
          </h2>
          <div className={`${REVEAL_TEXT} mt-8 h-px w-full bg-obsidian/20`} />
          <p
            className={`${REVEAL_TEXT} mt-6 font-display text-base leading-relaxed text-graphite`}
          >
            Fasilitas berikut tersedia untuk pengunjung padel, tenis, maupun
            kolam renang, dan dirawat mengikuti jadwal yang sama dengan lapangan
            dan kolamnya.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map(({ id, title, desc, meta, Icon }) => (
            <article
              key={id}
              className={`${REVEAL_TEXT} group relative flex flex-col overflow-hidden rounded-xl border border-obsidian/10 bg-paper-white p-7 transition-colors duration-300 hover:border-obsidian/25 motion-reduce:transition-none`}
            >
              {/* Kotak ikon — latar berubah abu-abu saat kartu/ikon di-hover. */}
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-obsidian/10 text-obsidian transition-[background-color,border-color,transform] duration-300 group-hover:scale-105 group-hover:border-transparent group-hover:bg-cloud-gray group-focus-within:bg-cloud-gray motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Icon className="h-7 w-7" />
              </span>

              <h3 className="mt-7 font-display text-xl font-bold tracking-display text-obsidian">
                {title}
              </h3>
              <p className="mt-3 flex-1 font-display text-sm leading-relaxed text-graphite">
                {desc}
              </p>

              <div className="mt-7 border-t border-obsidian/10 pt-4">
                <span className="font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                  {meta}
                </span>
              </div>

              {/* Garis aksen tepi bawah — tumbuh dari kiri saat hover. */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-obsidian transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100 motion-reduce:transition-none"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
