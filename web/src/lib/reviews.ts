/**
 * Ulasan pengunjung yang tampil di halaman /fasilitas.
 *
 * ⚠️ ISI DI BAWAH MASIH DATA CONTOH (placeholder), bukan ulasan asli.
 * Rencananya ulasan dikirim pengunjung lewat halaman /kontak, lalu dibaca
 * dari API. Sebelum situs tayang untuk publik, ganti `REVIEWS` dengan ulasan
 * sungguhan — menampilkan ulasan karangan sbg ulasan pengunjung tidak jujur
 * kepada calon pemesan.
 *
 * Saat sumbernya sudah berupa API, cukup ganti pemakaian `REVIEWS` di
 * `components/facilities/ReviewsSection.tsx` dengan hook TanStack Query di
 * `lib/queries.ts`; bentuk `Review` di bawah sengaja dibuat menyerupai baris
 * tabel supaya tidak perlu ada perubahan tampilan.
 */

export interface Review {
  id: string;
  /** Nama yang ditampilkan — inisialnya dipakai sbg monogram avatar. */
  name: string;
  /** 1–5. Nilai di luar rentang dipangkas saat render bintang. */
  rating: number;
  text: string;
  /** Fasilitas/cabang yang diulas — tampil sbg label kecil di kartu. */
  facility: string;
  /** "YYYY-MM-DD". */
  date: string;
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    name: "Anisa Rahmawati",
    rating: 5,
    facility: "Kolam Renang",
    date: "2026-07-12",
    text: "Kamar mandinya bersih dan pengatur air panasnya benar-benar berfungsi. Anak-anak tidak kedinginan lagi setelah berenang sore.",
  },
  {
    id: "r2",
    name: "Bagus Prasetyo",
    rating: 5,
    facility: "Padel",
    date: "2026-07-03",
    text: "Pesan lapangan lewat situsnya jelas — slot yang tampil kosong memang kosong. Parkirnya luas, datang jam ramai pun masih kebagian tempat.",
  },
  {
    id: "r3",
    name: "Dimas Ardiansyah",
    rating: 4,
    facility: "Tenis",
    date: "2026-06-21",
    text: "Lapangan terawat dan lampunya terang untuk sesi malam. Musholla ada di dalam area, jadi tidak perlu keluar saat waktu salat.",
  },
  {
    id: "r4",
    name: "Rina Kusumawati",
    rating: 5,
    facility: "Kolam Renang",
    date: "2026-06-08",
    text: "Gazebo di tepi kolam sangat membantu untuk menunggu anak les renang. Teduh, ada tempat duduk, dan tidak berdesakan.",
  },
  {
    id: "r5",
    name: "Yoga Pratama",
    rating: 4,
    facility: "Padel",
    date: "2026-05-30",
    text: "Sempat terkilir ringan waktu bermain dan langsung ditangani petugas dengan kotak P3K. Responsnya cepat, tidak dibiarkan menunggu.",
  },
  {
    id: "r6",
    name: "Hendra Wijaya",
    rating: 5,
    facility: "Membership",
    date: "2026-05-17",
    text: "Perpanjangan keanggotaan tidak ribet dan kartunya langsung aktif. Fasilitas bilas lengkap sampai sabun dan shampoo, jadi tinggal bawa handuk.",
  },
];

/** "Anisa Rahmawati" → "AR". Satu kata → dua huruf pertama. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "2026-07-12" → "Juli 2026". Diurai per bagian agar tidak tergeser zona waktu. */
export function formatReviewDate(value: string): string {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}
