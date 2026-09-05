"use client";

import { useRef, useState, type FormEvent } from "react";
import { Eyebrow } from "@/components/brand/Button";
import { REVEAL_TEXT, useEditorialReveal } from "@/lib/motion";
import {
  EMAIL,
  TOPIK,
  TOPIK_PESAN,
  mailtoLink,
  susunPesan,
  waLink,
  type PesanKontak,
} from "@/lib/contact";
import { copyText } from "@/lib/clipboard";
import { AlertIcon, CheckIcon, CopyIcon } from "./icons";

/**
 * Formulir kirim pesan.
 *
 * Pesan TIDAK dikirim ke server: backend belum punya penerimanya, dan
 * memasang formulir yang kirimannya tidak sampai ke mana-mana lebih buruk
 * daripada tidak memasangnya sama sekali. Yang dilakukan di sini adalah
 * menyusun isian menjadi satu pesan rapi, lalu menyerahkannya ke WhatsApp atau
 * aplikasi email milik pengunjung sendiri — jalur yang pasti sampai, dan
 * pengunjung memegang bukti kirimnya.
 *
 * Karena penyerahan itu bergantung pada peramban membuka aplikasi lain, selalu
 * disediakan jaring pengaman: panel status dengan tombol salin, sehingga pesan
 * yang sudah diketik tidak pernah hilang meski jendela barunya diblokir.
 *
 * Saat nanti ada endpoint POST /contact di backend, cukup fungsi `kirim` di
 * berkas ini yang berubah; tampilan dan validasinya tetap.
 */

type Kanal = "wa" | "email";

interface Isian {
  nama: string;
  balasKe: string;
  topik: string;
  tanggal: string;
  pesan: string;
}

type Galat = Partial<Record<"nama" | "balasKe" | "pesan", string>>;

const ISIAN_AWAL: Isian = {
  nama: "",
  balasKe: "",
  topik: TOPIK_PESAN[0],
  tanggal: "",
  pesan: "",
};

/** Longgar dengan sengaja: memvalidasi bentuk, bukan menebak operator. */
const TELP_RE = /^\+?[\d\s().-]{9,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PESAN_MIN = 10;

function validasi(f: Isian): Galat {
  const g: Galat = {};

  if (f.nama.trim().length < 2) g.nama = "Tuliskan nama Anda.";

  const kontak = f.balasKe.trim();
  if (!kontak) g.balasKe = "Isi nomor WhatsApp atau email agar kami bisa membalas.";
  else if (!TELP_RE.test(kontak) && !EMAIL_RE.test(kontak))
    g.balasKe = "Masukkan nomor telepon atau alamat email yang benar.";

  if (f.pesan.trim().length < PESAN_MIN)
    g.pesan = `Ceritakan sedikit lebih rinci — minimal ${PESAN_MIN} karakter.`;

  return g;
}

/** `yyyy-mm-dd` hari ini menurut waktu perangkat — batas bawah pemilih tanggal. */
function hariIni(): string {
  const d = new Date();
  const bulan = `${d.getMonth() + 1}`.padStart(2, "0");
  const tanggal = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${tanggal}`;
}

const LABEL =
  "block font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite";

const FIELD_BASE =
  "mt-2 w-full rounded-lg border bg-paper-white px-4 py-3 font-display text-[15px] text-obsidian outline-none transition-colors duration-200 placeholder:text-graphite/60 focus-visible:ring-4 focus-visible:ring-obsidian/20";

/**
 * Keadaan galat ditandai lewat tebal garis, ikon, dan kalimat — bukan warna.
 * Sistem desain ini monokrom, jadi tidak ada token merah yang bisa dipakai;
 * kebetulan itu juga cara yang benar secara aksesibilitas, karena penanda
 * tidak boleh bergantung pada warna semata.
 */
const fieldCls = (invalid: boolean) =>
  `${FIELD_BASE} ${invalid ? "border-obsidian" : "border-obsidian/15 hover:border-obsidian/30"}`;

function PesanGalat({ id, children }: { id: string; children: string }) {
  return (
    <p
      id={id}
      className="mt-2 flex items-start gap-2 font-display text-[13px] font-semibold leading-snug text-obsidian"
    >
      <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}

export default function MessageForm() {
  const root = useRef<HTMLElement>(null);
  useEditorialReveal(root);

  const [isian, setIsian] = useState<Isian>(ISIAN_AWAL);
  const [galat, setGalat] = useState<Galat>({});
  const [status, setStatus] = useState<{ kanal: Kanal; diblokir: boolean } | null>(
    null,
  );
  const [tersalin, setTersalin] = useState(false);

  const namaRef = useRef<HTMLInputElement>(null);
  const balasRef = useRef<HTMLInputElement>(null);
  const pesanRef = useRef<HTMLTextAreaElement>(null);

  const ubah = (kunci: keyof Isian) => (nilai: string) => {
    setIsian((s) => ({ ...s, [kunci]: nilai }));
    // Galat dibersihkan begitu kolomnya disunting: membiarkan pesan merah
    // menempel sementara pengunjung sedang memperbaiki terasa menghakimi.
    setGalat((g) => ({ ...g, [kunci]: undefined }));
  };

  function pesanTerkirim(): PesanKontak {
    return {
      nama: isian.nama,
      balasKe: isian.balasKe,
      topik: isian.topik,
      tanggal: isian.tanggal || undefined,
      pesan: isian.pesan,
    };
  }

  function kirim(kanal: Kanal) {
    const g = validasi(isian);
    setGalat(g);

    if (Object.keys(g).length > 0) {
      // Fokuskan kolom bermasalah pertama — tanpa ini, pada layar sempit
      // pesan galatnya bisa berada jauh di luar pandangan.
      (g.nama ? namaRef : g.balasKe ? balasRef : pesanRef).current?.focus();
      setStatus(null);
      return;
    }

    setTersalin(false);
    const isi = pesanTerkirim();

    if (kanal === "email") {
      window.location.href = mailtoLink(isi);
      setStatus({ kanal, diblokir: false });
      return;
    }

    // `noopener` sengaja TIDAK dititipkan lewat argumen fitur: bila ditulis di
    // sana, window.open selalu mengembalikan null menurut spesifikasi, sehingga
    // kita kehilangan satu-satunya cara membedakan "tab berhasil dibuka" dari
    // "diblokir peramban" — dan panel status akan salah menuduh setiap kali.
    // Rujukan opener diputus setelahnya, dengan perlindungan yang setara.
    const jendela = window.open(waLink(isi), "_blank");
    if (jendela) jendela.opener = null;

    setStatus({ kanal, diblokir: jendela === null });
  }

  async function salinIsi() {
    const ok = await copyText(susunPesan(pesanTerkirim()));
    setTersalin(ok);
  }

  return (
    <section ref={root} id="pesan" className="bg-cloud-gray px-6 py-24 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* ---- Ajakan ---- */}
          <div>
            <div className={REVEAL_TEXT}>
              <Eyebrow>Kirim Pesan</Eyebrow>
            </div>
            <h2
              className={`${REVEAL_TEXT} mt-5 font-display text-4xl font-black leading-none tracking-display text-obsidian sm:text-5xl`}
            >
              Tulis sekali,
              <br />
              kami balas cepat.
            </h2>
            <p
              className={`${REVEAL_TEXT} mt-7 max-w-xl font-display text-lg leading-relaxed text-obsidian/80`}
            >
              Isi keterangan seperlunya, lalu pilih mau mengirim lewat WhatsApp
              atau email. Pesannya sudah kami susun rapi, jadi Anda tidak perlu
              mengetik ulang keterangan yang sama.
            </p>

            <p
              className={`${REVEAL_TEXT} mt-8 font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite`}
            >
              Paling Sering Ditanyakan
            </p>
            <ul className={`${REVEAL_TEXT} mt-4 max-w-xl space-y-3`}>
              {TOPIK.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 font-display text-[15px] leading-relaxed text-graphite"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-obsidian/30"
                  />
                  {t}
                </li>
              ))}
            </ul>

            <p
              className={`${REVEAL_TEXT} mt-10 max-w-xl border-t border-obsidian/10 pt-6 font-display text-[13px] leading-relaxed text-graphite`}
            >
              Pesan dikirim lewat aplikasi WhatsApp atau email milik Anda
              sendiri. Halaman ini tidak menyimpan isian apa pun, dan tidak ada
              data yang dikirim ke server saat Anda menekan tombol.
            </p>
          </div>

          {/* ---- Formulir ---- */}
          <div className={REVEAL_TEXT}>
            <form
              noValidate
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                kirim("wa");
              }}
              className="rounded-xl border border-obsidian/10 bg-paper-white p-7 sm:p-9"
            >
              {/* Nama */}
              <div>
                <label htmlFor="kontak-nama" className={LABEL}>
                  Nama
                </label>
                <input
                  id="kontak-nama"
                  ref={namaRef}
                  value={isian.nama}
                  onChange={(e) => ubah("nama")(e.target.value)}
                  autoComplete="name"
                  placeholder="Nama lengkap Anda"
                  aria-invalid={Boolean(galat.nama)}
                  aria-describedby={galat.nama ? "kontak-nama-galat" : undefined}
                  className={fieldCls(Boolean(galat.nama))}
                />
                {galat.nama && (
                  <PesanGalat id="kontak-nama-galat">{galat.nama}</PesanGalat>
                )}
              </div>

              {/* Kontak balasan */}
              <div className="mt-6">
                <label htmlFor="kontak-balas" className={LABEL}>
                  Nomor WhatsApp atau Email
                </label>
                <input
                  id="kontak-balas"
                  ref={balasRef}
                  value={isian.balasKe}
                  onChange={(e) => ubah("balasKe")(e.target.value)}
                  autoComplete="tel"
                  inputMode="text"
                  placeholder="0812xxxxxxx atau nama@email.com"
                  aria-invalid={Boolean(galat.balasKe)}
                  aria-describedby={
                    galat.balasKe ? "kontak-balas-galat" : "kontak-balas-bantuan"
                  }
                  className={fieldCls(Boolean(galat.balasKe))}
                />
                {galat.balasKe ? (
                  <PesanGalat id="kontak-balas-galat">{galat.balasKe}</PesanGalat>
                ) : (
                  <p
                    id="kontak-balas-bantuan"
                    className="mt-2 font-display text-[13px] leading-snug text-graphite"
                  >
                    Ke mana jawaban kami dikirim.
                  </p>
                )}
              </div>

              {/* Topik */}
              <fieldset className="mt-6">
                <legend className={LABEL}>Topik</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TOPIK_PESAN.map((t) => (
                    <label key={t} className="cursor-pointer">
                      <input
                        type="radio"
                        name="kontak-topik"
                        value={t}
                        checked={isian.topik === t}
                        onChange={() => ubah("topik")(t)}
                        className="peer sr-only"
                      />
                      <span className="block rounded-lg border border-obsidian/15 px-4 py-2 font-condensed text-[11px] font-semibold uppercase tracking-eyebrow text-graphite transition-colors duration-200 hover:border-obsidian/40 peer-checked:border-obsidian peer-checked:bg-obsidian peer-checked:text-paper-white peer-focus-visible:ring-4 peer-focus-visible:ring-obsidian/20">
                        {t}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Tanggal */}
              <div className="mt-6">
                <label htmlFor="kontak-tanggal" className={LABEL}>
                  Tanggal Rencana{" "}
                  <span className="font-display text-[10px] normal-case tracking-normal text-graphite/70">
                    (opsional)
                  </span>
                </label>
                <input
                  id="kontak-tanggal"
                  type="date"
                  min={hariIni()}
                  value={isian.tanggal}
                  onChange={(e) => ubah("tanggal")(e.target.value)}
                  className={fieldCls(false)}
                />
              </div>

              {/* Pesan */}
              <div className="mt-6">
                <label htmlFor="kontak-pesan" className={LABEL}>
                  Pesan
                </label>
                <textarea
                  id="kontak-pesan"
                  ref={pesanRef}
                  rows={5}
                  value={isian.pesan}
                  onChange={(e) => ubah("pesan")(e.target.value)}
                  placeholder="Contoh: ingin menyewa satu lapangan padel sekitar pukul 19.00, untuk empat orang."
                  aria-invalid={Boolean(galat.pesan)}
                  aria-describedby={galat.pesan ? "kontak-pesan-galat" : undefined}
                  className={`${fieldCls(Boolean(galat.pesan))} resize-y leading-relaxed`}
                />
                {galat.pesan && (
                  <PesanGalat id="kontak-pesan-galat">{galat.pesan}</PesanGalat>
                )}
              </div>

              {/* Aksi — satu-satunya gradient di halaman ini. */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-speedrun px-8 py-3.5 font-condensed text-xs font-semibold uppercase tracking-eyebrow text-paper-white outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-4 focus-visible:ring-obsidian/20 sm:text-sm"
                >
                  Kirim via WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => kirim("email")}
                  className="inline-flex items-center justify-center rounded-lg border border-obsidian/15 px-8 py-3.5 font-condensed text-xs font-semibold uppercase tracking-eyebrow text-obsidian outline-none transition-colors duration-200 hover:border-obsidian/40 hover:bg-obsidian/[0.03] focus-visible:ring-4 focus-visible:ring-obsidian/20 sm:text-sm"
                >
                  Kirim via Email
                </button>
              </div>

              {/* Panel status — jaring pengaman bila aplikasi gagal terbuka. */}
              {status && (
                <div
                  role="status"
                  className="mt-7 rounded-lg border border-obsidian/15 bg-cloud-gray/60 p-6"
                >
                  <p className="font-condensed text-[10px] font-semibold uppercase tracking-eyebrow text-graphite">
                    {status.diblokir ? "Jendela Baru Diblokir" : "Pesan Siap Dikirim"}
                  </p>
                  <p className="mt-2 font-display text-sm leading-relaxed text-obsidian/80">
                    {status.diblokir
                      ? "Peramban menahan pembukaan tab baru. Salin isi pesan di bawah, lalu tempelkan di chat WhatsApp kami."
                      : status.kanal === "wa"
                        ? "WhatsApp sedang dibuka di tab baru dengan pesan yang sudah terisi — tinggal Anda kirim. Kalau tabnya tidak muncul, salin isi pesannya di bawah."
                        : `Aplikasi email Anda sedang dibuka dengan pesan yang sudah terisi. Kalau tidak muncul, salin isi pesannya lalu kirim ke ${EMAIL}.`}
                  </p>

                  <button
                    type="button"
                    onClick={salinIsi}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-obsidian/15 bg-paper-white px-4 py-2 font-condensed text-[11px] font-semibold uppercase tracking-eyebrow text-obsidian outline-none transition-colors duration-200 hover:border-obsidian/40 focus-visible:ring-4 focus-visible:ring-obsidian/20"
                  >
                    {tersalin ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5" />
                    )}
                    {tersalin ? "Isi pesan tersalin" : "Salin isi pesan"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
