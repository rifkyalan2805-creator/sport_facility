/**
 * Sumber tunggal data kontak, lokasi, jam buka, dan FAQ klub.
 *
 * Alasan berkas ini ada: sebelum disatukan, nilai yang sama sudah ditulis
 * ulang di beberapa halaman dan mulai menyimpang — jam operasional sempat
 * tertulis 22.00 di /fasilitas sementara /tentang-kami menulis 23.00. Angka
 * yang diulang di banyak berkas pasti berbeda cepat atau lambat, jadi seluruh
 * halaman kini membaca dari sini.
 *
 * TODO(pemilik): NILAI KONTAK DI BAWAH MASIH PLACEHOLDER dan harus diganti
 * sebelum situs dipublikasikan — nomor WhatsApp, telepon, email, dan akun
 * Instagram. Cukup berkas ini saja; tidak ada nilai kontak yang ditulis ulang
 * di tempat lain.
 */

/* ------------------------------------------------------------------ *
 * Jam & waktu balas
 * ------------------------------------------------------------------ */

/** Kalimat jam buka — dipakai apa adanya di kartu, tabel meta, dan FAQ. */
export const JAM_OPERASIONAL = "Setiap hari · 06.00 hingga 23.00 WIB";

/** Versi pendek untuk baris meta yang sempit. */
export const JAM_OPERASIONAL_RINGKAS = "06.00 – 23.00 WIB";

export const WAKTU_BALAS = "Dibalas pada jam operasional";

/* ------------------------------------------------------------------ *
 * Kanal
 * ------------------------------------------------------------------ */

/**
 * Nomor WhatsApp dalam format wa.me: kode negara tanpa tanda plus, spasi,
 * atau tanda hubung. Dipakai untuk tautan kanal sekaligus pengiriman formulir,
 * sehingga keduanya tidak mungkin menunjuk nomor berbeda.
 */
export const WA_NUMBER = "6281200000000";

/** Alamat email penerima — dipakai kartu kanal dan tombol kirim via email. */
export const EMAIL = "halo@istanadiengclubhouse.id";

export type KanalId = "whatsapp" | "telepon" | "email" | "instagram";

export interface Kanal {
  id: KanalId;
  label: string;
  /** Versi yang dibaca pengunjung (boleh berformat rapi). */
  value: string;
  href: string;
  /** Isi yang disalin tombol "Salin" — tanpa format, siap tempel. */
  copy: string;
  external: boolean;
}

export const KANAL: Kanal[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "+62 812-0000-0000",
    href: `https://wa.me/${WA_NUMBER}`,
    copy: "+6281200000000",
    external: true,
  },
  {
    id: "telepon",
    label: "Telepon",
    value: "(0341) 000 000",
    href: "tel:+62341000000",
    copy: "+62341000000",
    external: false,
  },
  {
    id: "email",
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    copy: EMAIL,
    external: false,
  },
  {
    id: "instagram",
    label: "Instagram",
    value: "@istanadiengclubhouse",
    href: "https://instagram.com/istanadiengclubhouse",
    copy: "https://instagram.com/istanadiengclubhouse",
    external: true,
  },
];

/* ------------------------------------------------------------------ *
 * Lokasi
 * ------------------------------------------------------------------ */

export const LOKASI = {
  nama: "ISTANA DIENG CLUB HOUSE",
  alamat:
    "Perumahan Istana Dieng, Jl. Istana Dieng Raya III, Bandulan, Kec. Sukun, Kota Malang, Jawa Timur 65146",
  /** Versi pendek untuk kartu sempit dan baris meta. */
  alamatRingkas:
    "Perumahan Istana Dieng, Jl. Istana Dieng Raya III, Bandulan, Kec. Sukun, Kota Malang.",
  kotaRingkas: "Bandulan, Kota Malang",
  plusCode: "2JF2+28X Bandulan, Malang",
  // Hasil dekode Plus Code di atas — presisi petak ±3 meter. Untuk menggeser
  // pin: klik kanan di Google Maps, salin lat,lng, ganti dua angka ini.
  lat: -7.977387,
  lng: 112.600859,
  zoom: 18,
} as const;

const KOORDINAT = encodeURIComponent(`${LOKASI.lat},${LOKASI.lng}`);

/**
 * Peta memakai iframe `output=embed` milik Google Maps yang TIDAK memerlukan
 * API key maupun penagihan — URL-nya cukup berisi koordinat, zoom, dan bahasa.
 */
export const mapEmbedSrc = (zoom: number) =>
  `https://www.google.com/maps?q=${KOORDINAT}&z=${zoom}&hl=id&output=embed`;

export const MAPS_DIR_URL = `https://www.google.com/maps/dir/?api=1&destination=${KOORDINAT}`;
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${KOORDINAT}`;

/* ------------------------------------------------------------------ *
 * Topik
 * ------------------------------------------------------------------ */

/** Hal yang paling sering ditanyakan — dipasang agar pertanyaan lebih terarah. */
export const TOPIK = [
  "Ketersediaan lapangan di tanggal tertentu",
  "Harga sewa, tiket kolam, dan paket keanggotaan",
  "Jadwal turnamen serta kelas yang akan datang",
  "Penyewaan area untuk acara komunitas atau kantor",
];

/**
 * Pilihan topik pada formulir. Sengaja lebih pendek daripada `TOPIK` di atas:
 * yang ini masuk ke baris subjek pesan, jadi harus terbaca utuh di notifikasi
 * WhatsApp maupun daftar email.
 */
export const TOPIK_PESAN = [
  "Reservasi lapangan",
  "Harga & keanggotaan",
  "Turnamen & kelas",
  "Sewa area",
  "Lainnya",
];

/* ------------------------------------------------------------------ *
 * FAQ
 * ------------------------------------------------------------------ */

/**
 * Pertanyaan yang jawabannya bisa dipastikan dari aplikasi ini sendiri —
 * alur reservasi, jenis keanggotaan, halaman harga. Hal yang bergantung pada
 * kebijakan pemilik (misalnya aturan pembatalan) sengaja tidak dikarang di
 * sini; jawabannya mengarahkan pengunjung untuk bertanya langsung.
 *
 * Tabel `faqs` sudah ada di database tetapi belum berisi apa pun, jadi daftar
 * ini masih statis. Saat nanti diisi lewat panel admin, halaman kontak tinggal
 * membaca `GET /api/v1/cms/faqs` tanpa mengubah tampilannya.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: "Bagaimana cara memesan lapangan padel atau tenis?",
    a: "Buat akun terlebih dahulu, lalu buka halaman reservasi dan pilih tanggal serta jam yang diinginkan. Slot yang sudah terisi tidak akan muncul sebagai pilihan, jadi jam yang bisa Anda klik dipastikan masih kosong saat itu.",
  },
  {
    q: "Apakah harus punya akun untuk memesan?",
    a: "Ya. Reservasi lapangan, tiket kolam, dan keanggotaan semuanya tercatat pada satu akun, sehingga riwayat dan status pemesanan Anda bisa dilihat kapan saja lewat halaman Dashboard.",
  },
  {
    q: "Di mana saya bisa melihat daftar harga?",
    a: "Seluruh tarif dikumpulkan di halaman Harga — terpisah untuk lapangan padel, lapangan tenis, dan kolam renang, termasuk paket keanggotaan yang sedang berlaku.",
  },
  {
    q: "Apa bedanya keanggotaan kolam dan abonemen tenis?",
    a: "Keanggotaan kolam berlaku untuk periode tertentu dan dipakai setiap kali Anda berenang. Abonemen tenis mengunci satu slot jam yang sama secara berulang setiap pekan, sehingga jadwal latihan Anda tidak perlu direbutkan tiap kali.",
  },
  {
    q: "Bagaimana jika jam yang saya inginkan sudah penuh?",
    a: "Jadwal berubah cukup sering karena ada pemesanan yang dibatalkan. Cara tercepat adalah mengabari kami lewat WhatsApp dengan menyebut tanggal dan rentang jam yang Anda incar, supaya kami bisa memberi tahu begitu ada slot yang terbuka.",
  },
  {
    q: "Bisakah menyewa area untuk acara komunitas atau kantor?",
    a: "Bisa. Sampaikan perkiraan tanggal, jumlah peserta, dan fasilitas yang dibutuhkan lewat formulir di halaman ini atau langsung via WhatsApp, agar kami dapat memeriksa ketersediaan dan menyiapkan penawarannya.",
  },
  {
    q: "Apakah tersedia tempat parkir?",
    a: "Tersedia area parkir yang menampung kendaraan roda dua maupun roda empat, berada di dalam kawasan Perumahan Istana Dieng bersama seluruh fasilitas klub.",
  },
  {
    q: "Jam berapa klub buka?",
    a: `${JAM_OPERASIONAL}. Di luar jam tersebut pesan yang masuk tetap kami terima, dan akan dibalas begitu jam operasional dimulai.`,
  },
];

/* ------------------------------------------------------------------ *
 * Penyusun tautan pesan
 * ------------------------------------------------------------------ */

export interface PesanKontak {
  nama: string;
  /** Nomor WhatsApp atau email tempat pengunjung ingin dibalas. */
  balasKe: string;
  topik: string;
  /** Tanggal rencana kunjungan (opsional) dalam format ISO `yyyy-mm-dd`. */
  tanggal?: string;
  pesan: string;
}

/** Baris subjek — dipakai email, dan jadi kalimat pembuka pesan WhatsApp. */
export const subjekPesan = (p: PesanKontak) => `${p.topik} — ${p.nama}`;

/**
 * Menyusun isi pesan sebagai teks polos.
 *
 * Sengaja satu fungsi untuk WhatsApp maupun email supaya isi yang diterima
 * pemilik selalu sama bentuknya, dari kanal mana pun pengunjung mengirim.
 * Teks ini juga yang disalin tombol cadangan ketika jendela aplikasi gagal
 * dibuka oleh pemblokir popup.
 */
export function susunPesan(p: PesanKontak): string {
  const baris = [
    `Halo ${LOKASI.nama}, saya ${p.nama.trim()}.`,
    "",
    `Topik: ${p.topik}`,
  ];

  if (p.tanggal) baris.push(`Tanggal rencana: ${formatTanggal(p.tanggal)}`);

  baris.push(`Bisa dihubungi di: ${p.balasKe.trim()}`, "", p.pesan.trim());

  return baris.join("\n");
}

/** `yyyy-mm-dd` → `Sabtu, 5 September 2026`; kembalikan apa adanya jika tak terbaca. */
export function formatTanggal(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const waLink = (p: PesanKontak) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(susunPesan(p))}`;

export const mailtoLink = (p: PesanKontak) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(
    subjekPesan(p),
  )}&body=${encodeURIComponent(susunPesan(p))}`;
