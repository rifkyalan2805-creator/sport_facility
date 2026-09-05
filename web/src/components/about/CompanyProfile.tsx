"use client";

import { useRef } from "react";
import { Eyebrow } from "@/components/brand/Button";
import { REVEAL_MEDIA, REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";

/**
 * Section 1 — Profil perusahaan, layanan, dan riwayat berdirinya klub.
 *
 * Satu-satunya section berfoto di halaman ini (permintaan pemilik: lokasi dan
 * dua section sesudahnya murni tipografi). Ketiga foto diberi perlakuan
 * sinematik: didesaturasi sebagian, digelapkan, lalu ditimpa gradasi hitam dari
 * bawah — sama seperti sampul beranda & halaman Fasilitas, sehingga keterangan
 * putih di atasnya tetap terbaca berapa pun terangnya foto aslinya.
 */

/** Ringkasan pembuka — tiga fakta yang paling sering dicari pengunjung baru. */
const META = [
  { label: "Berdiri", value: "Tahun 2000" },
  { label: "Lokasi", value: "Bandulan, Kec. Sukun, Kota Malang" },
  { label: "Cabang Olahraga", value: "Padel · Tenis · Kolam Renang" },
];

/**
 * Foto pilihan pemilik: padel 1, tenis 1, pool 1 — masing-masing satu cabang,
 * jadi ketiganya membaca sebagai ringkasan fasilitas, bukan galeri.
 * Nama berkas mengandung spasi → `src` dibungkus encodeURI() saat dirender.
 */
const FOTO = [
  {
    src: "/images/sport club/padel/paddle 1.jpg",
    label: "Padel",
    caption: "Lapangan berdinding kaca dengan permukaan dan pencahayaan kompetisi.",
    alt: "Lapangan padel ISTANA DIENG CLUB HOUSE",
  },
  {
    src: "/images/sport club/Tennis/tennis 1.jpg",
    label: "Tenis",
    caption: "Cabang tertua di klub ini — dipakai harian maupun lewat abonemen.",
    alt: "Lapangan tenis ISTANA DIENG CLUB HOUSE",
  },
  {
    src: "/images/sport club/swimming pools/swimming 1.jpg",
    label: "Kolam Renang",
    caption: "Kolam terawat dengan gazebo tepi kolam untuk pengunjung dan keluarga.",
    alt: "Kolam renang ISTANA DIENG CLUB HOUSE",
  },
];

/** Layanan yang benar-benar berjalan di sistem reservasi klub. */
const LAYANAN = [
  {
    no: "01",
    title: "Reservasi Lapangan",
    desc: "Padel dan tenis dipesan per jam. Jadwal ketersediaan tampil langsung, tanpa perlu menelepon lebih dulu.",
  },
  {
    no: "02",
    title: "Tiket Kolam Renang",
    desc: "Tiket harian per sesi renang, dengan kuota yang dijaga supaya kolam tidak pernah terlalu padat.",
  },
  {
    no: "03",
    title: "Keanggotaan & Abonemen",
    desc: "Membership kolam renang dan abonemen tenis untuk yang datang rutin setiap minggu di jam tetap.",
  },
  {
    no: "04",
    title: "Agenda & Turnamen",
    desc: "Kelas, sparring bersama, dan turnamen internal yang jadwalnya diumumkan lewat halaman agenda.",
  },
];

/**
 * Tonggak riwayat klub.
 *
 * TODO(pemilik): daftar ini SENGAJA hanya memuat dua hal yang sudah pasti —
 * tahun berdiri (2000) dan keadaan sekarang. Tonggak di antaranya belum
 * dikirim, dan mengarang tahun untuk riwayat perusahaan yang nyata jelas tidak
 * bisa dibenarkan. Tambahkan entri baru di tengah larik ini dengan bentuk yang
 * sama, mis.:
 *   { year: "2014", title: "Renovasi kolam", desc: "…" },
 * Urutannya lama → baru; tampilannya menyesuaikan sendiri berapa pun jumlahnya.
 */
const RIWAYAT = [
  {
    year: "2000",
    title: "Club house mulai beroperasi",
    desc: "Fasilitas olahraga dibuka di dalam kawasan Perumahan Istana Dieng, Bandulan — lapangan dan kolam yang sampai hari ini masih menempati lahan yang sama.",
  },
  {
    year: "Kini",
    title: "Tiga cabang, satu sistem reservasi",
    desc: "Padel, tenis, dan kolam renang dikelola satu tim di bawah satu jadwal operasional, dengan pemesanan, keanggotaan, dan pembayaran yang berjalan dalam satu sistem.",
  },
];

export default function CompanyProfile() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  return (
    <section ref={root} id="profil" className="bg-paper-white">
      {/* ---- Ringkasan pembuka ---- */}
      <div className="border-b border-obsidian/10 px-6">
        <dl className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-obsidian/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {META.map((m) => (
            <div key={m.label} className="py-7 md:px-8 md:first:pl-0 md:last:pr-0">
              <dt className="font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                {m.label}
              </dt>
              <dd className="mt-2 font-display text-base font-semibold tracking-tight text-obsidian">
                {m.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-28">
        {/* ---- Profil perusahaan ---- */}
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div>
            <div className={REVEAL_TEXT}>
              <Eyebrow>Profil Perusahaan</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
            >
              Satu kawasan,
              <br />
              satu tim,
              <br />
              satu standar.
            </h2>
          </div>

          <div className="lg:pt-2">
            <p
              className={`${REVEAL_TEXT} font-display text-lg leading-relaxed text-obsidian/80 sm:text-xl`}
            >
              ISTANA DIENG CLUB HOUSE adalah klub olahraga terpadu di dalam
              kawasan Perumahan Istana Dieng, Kota Malang. Kami mengelola
              lapangan padel, lapangan tenis, dan kolam renang di satu lokasi —
              bukan tiga tempat berbeda yang kebetulan bertetangga.
            </p>
            <p
              className={`${REVEAL_TEXT} mt-6 font-display text-base leading-relaxed text-graphite`}
            >
              Konsekuensinya sederhana tapi terasa: satu tim perawatan yang
              memegang semua permukaan, satu jam operasional yang berlaku sama,
              dan satu sistem reservasi untuk memesan lapangan, membeli tiket
              kolam, sampai memperpanjang keanggotaan. Pengunjung tidak perlu
              menghafal aturan yang berbeda-beda untuk tiap cabang.
            </p>
          </div>
        </div>

        {/* ---- Tiga foto sinematik ---- */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mt-20 md:gap-5">
          {FOTO.map((f, i) => (
            <figure
              key={f.src}
              // Kolom tengah diturunkan sedikit di layar lebar — irama editorial,
              // supaya tiga foto tidak terbaca sebagai deretan yang kaku.
              className={`${REVEAL_MEDIA} group relative isolate overflow-hidden rounded-xl bg-obsidian ${
                i === 1 ? "md:translate-y-10" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={encodeURI(f.src)}
                alt={f.alt}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover opacity-80 grayscale-[0.35] transition-[transform,opacity,filter] duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100 group-hover:grayscale-0 motion-reduce:transition-none"
              />
              {/* Gradasi hitam — tepi bawah pekat, meredup ke atas. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <Eyebrow tone="light" className="!text-paper-white">
                  {f.label}
                </Eyebrow>
                <p className="mt-2.5 font-display text-sm leading-relaxed text-paper-white/75">
                  {f.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* ---- Layanan ---- */}
        <div className="mt-24 md:mt-32">
          <div className={REVEAL_TEXT}>
            <Eyebrow>Layanan Kami</Eyebrow>
          </div>
          <h3
            className={`${REVEAL_TEXT} mt-5 max-w-2xl font-display text-3xl font-black leading-none tracking-display text-obsidian sm:text-4xl`}
          >
            Empat hal yang bisa
            <br />
            diurus dari satu akun.
          </h3>

          <div className="mt-12 grid grid-cols-1 gap-px border-t border-obsidian/10 sm:grid-cols-2">
            {LAYANAN.map((l) => (
              <div
                key={l.no}
                className={`${REVEAL_TEXT} border-b border-obsidian/10 py-8 sm:odd:pr-10 sm:even:pl-10 sm:even:border-l`}
              >
                <span className="font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian/30">
                  {l.no}
                </span>
                <h4 className="mt-3 font-display text-xl font-semibold tracking-tight text-obsidian">
                  {l.title}
                </h4>
                <p className="mt-2.5 max-w-md font-display text-[15px] leading-relaxed text-graphite">
                  {l.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Riwayat ---- */}
        <div className="mt-24 md:mt-32">
          <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <div className={REVEAL_TEXT}>
                <Eyebrow>Riwayat</Eyebrow>
              </div>
              <h3
                className={`${REVEAL_TEXT} mt-5 font-display text-3xl font-black leading-none tracking-display text-obsidian sm:text-4xl`}
              >
                Dari tahun 2000,
                <br />
                sampai hari ini.
              </h3>
            </div>

            <div className="lg:pt-2">
              <p
                className={`${REVEAL_TEXT} font-display text-base leading-relaxed text-graphite`}
              >
                Club house ini berdiri pada tahun 2000 di dalam kawasan
                Perumahan Istana Dieng, Bandulan. Lebih dari dua dekade
                kemudian kegiatannya masih berjalan di lahan yang sama — yang
                bertambah adalah cabang olahraganya, standar perawatannya, dan
                cara orang memesan jamnya.
              </p>
            </div>
          </div>

          {/* Rel vertikal — bentuknya tidak bergantung pada jumlah tonggak,
              jadi menambah entri di RIWAYAT tidak merusak tata letak. */}
          <ol className="mt-14 max-w-3xl border-l border-obsidian/15 pl-8">
            {RIWAYAT.map((r) => (
              <li key={r.year} className={`${REVEAL_TEXT} relative pb-12 last:pb-0`}>
                <span
                  aria-hidden
                  className="absolute -left-9 top-2 h-2 w-2 rounded-full bg-obsidian"
                />
                <span className="block font-condensed text-xs font-semibold uppercase tracking-eyebrow text-graphite">
                  {r.year}
                </span>
                <h4 className="mt-3 font-display text-xl font-semibold tracking-tight text-obsidian">
                  {r.title}
                </h4>
                <p className="mt-2.5 font-display text-[15px] leading-relaxed text-graphite">
                  {r.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
