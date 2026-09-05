# Proposal Tesis (S2) — Draf Singkat

**Judul sementara**
> **Mitigasi Kanibalisasi Pendapatan pada Alokasi Slot Fasilitas Olahraga Multi-Cabang:
> Model Pagu Abonemen Berbasis RevPASH Ter-amortisasi dan Evaluasinya melalui Backtesting Data Transaksi**

**Sudut penelitian (terkunci):** revenue cannibalization pada alokasi slot — abonemen tenis mengunci jam prime dengan yield per-jam lebih rendah daripada insidentil (walk-in).
**Metode evaluasi utama:** backtesting terhadap data transaksi historis venue.
**Posisi artefak:** sistem SportHub adalah *instantiation* (artefak DSR), **bukan** kontribusi ilmiahnya. Kontribusinya ada pada model pengukuran + kebijakan alokasi yang diuji di atasnya.

> ⚠️ **Catatan kejujuran akademik.** Tabel state of the art di BAB II baru terisi 4 sumber yang benar-benar terverifikasi (ada URL). Sisanya sengaja dibiarkan sebagai **slot kosong + protokol pencarian**, bukan diisi sitasi karangan. Angka-angka venue yang ditandai `[ISI]` wajib diganti data riil sebelum sidang proposal.

---

## Ringkasan masalah dalam satu paragraf

Venue mengoperasikan 2 lapangan tenis (06:00–22:00) dan 3 lapangan padel (06:00–23:00), namun menjual kapasitas yang sama melalui dua kanal dengan yield berbeda tanpa pagu apa pun. Paket abonemen tenis dijual pada harga implisit **Rp120.000–130.000 per sesi**, sementara tarif insidentil pada jam berlampu adalah **Rp175.000 per jam** — selisih **Rp45.000–55.000 (26–31%) per court-hour**. Karena abonemen bersifat berulang mingguan dan pemegangnya secara rasional memilih jam prime (sore–malam), kapasitas dengan willingness-to-pay tertinggi justru paling rawan terkunci pada tarif terendah. Sistem saat ini tidak membatasi hal tersebut, dan — karena booking abonemen dicatat `total_price = 0` — kerugiannya bahkan **tidak terlihat** pada pelaporan pendapatan per slot.

---

# BAB I — PENDAHULUAN

## 1.1 Latar Belakang

Latar belakang disusun dari kondisi faktual venue, bukan dari klaim umum tentang perkembangan teknologi.

**(a) Struktur kapasitas terbatas dan tidak dapat disimpan (perishable).**

| Cabang | Jumlah lapangan | Jam operasi | Kapasitas harian |
|---|---|---|---|
| Tenis | 2 (`TNS-1`, `TNS-2`) | 06:00–22:00 | 32 court-hour |
| Padel | 3 (`PDL-A/B/C`) | 06:00–23:00 | 51 court-hour |

Court-hour yang tidak terjual pada suatu jam hilang permanen — karakteristik klasik yang membuat domain ini layak dianalisis dengan kerangka *revenue management* (RM).

**(b) Struktur tarif tenis membuat abonemen lebih murah justru pada slot bernilai tertinggi.**

| Kanal | Dengan lampu | Tanpa lampu |
|---|---|---|
| Insidentil (walk-in) | Rp175.000 | Rp155.000 |
| Tarif abonemen per-jam | Rp165.000 | Rp145.000 |
| Paket abonemen prabayar (harga implisit/sesi) | Rp120.000 – Rp130.000 | idem |

Harga implisit paket dihitung dari tiga paket yang dijual: 8 sesi/Rp1.040.000 (=130.000), 12 sesi/Rp1.500.000 (=125.000), dan 24 sesi/Rp2.880.000 (=120.000). Diskon volume ini wajar secara bisnis; yang menjadi masalah penelitian adalah **tidak adanya pembatasan slot mana yang boleh dikonsumsi dengan tarif diskon tersebut**.

**(c) Diferensiasi harga yang ada bersifat anchor, bukan berbasis permintaan.**
Padel hanya mengenal dua tarif: `normal` Rp200.000 dan `off_peak` Rp150.000 yang berlaku **flat sepanjang 06:00–15:00**, tanpa membedakan hari kerja/akhir pekan maupun tingkat permintaan aktual. Praktik pemasaran sejenis (harga coret) terlihat pada platform pembanding dan akan didokumentasikan sebagai bukti empiris di BAB II.

**(d) Kerugiannya tidak terukur oleh sistem pelaporan saat ini.**
Booking berbasis abonemen disimpan dengan `total_price = 0`; pendapatan diakui sekali saat paket dibeli dan dipetakan ke kategori konstan "Abonemen". Akibatnya laporan pendapatan tidak dapat menjawab pertanyaan "berapa rupiah yang dihasilkan court-hour 19:00 hari Selasa?" Ini bukan sekadar kelemahan implementasi — ini **celah pengukuran** yang harus diselesaikan lebih dulu sebelum kanibalisasi dapat dikuantifikasi.

**(e) Data untuk menelitinya sudah tersedia.** Basis data operasional menyimpan `bookings` (tanggal, jam mulai/selesai, durasi, tipe booking, referensi abonemen, status, pembatalan), `occupancy_logs` (matriks `court × tanggal × hour_slot`), `waiting_list` (permintaan yang tidak terlayani beserta jam yang diinginkan), serta `payments`/`payment_items`. Kombinasi `occupancy_logs` + `waiting_list` inilah yang memungkinkan estimasi permintaan tergeser (*displaced demand*) secara empiris, bukan asumtif.

## 1.2 Rumusan Masalah

1. **RQ1 (pengukuran).** Bagaimana merumuskan RevPASH ter-amortisasi yang membuat pendapatan court-hour dari kontrak prabayar (abonemen) dapat diperbandingkan langsung dengan court-hour insidentil, dan berapa besar selisih yield (Rp/court-hour) antara keduanya pada slot prime selama periode pengamatan?
2. **RQ2 (kuantifikasi masalah).** Berapa estimasi pendapatan yang hilang (*displaced revenue*) akibat okupansi slot prime oleh abonemen, setelah permintaan historis dikoreksi dari efek *censoring*?
3. **RQ3 (intervensi).** Apakah kebijakan pagu alokasi abonemen per zona waktu (*protection level* untuk permintaan insidentil), dengan atau tanpa diferensiasi tarif, meningkatkan RevPASH secara signifikan pada backtesting data historis — dan berapa besar penurunan sesi abonemen terlayani yang menjadi konsekuensinya?

Ketiganya dapat dijawab dengan angka. Tidak ada pertanyaan berbentuk "bagaimana merancang sistem".

## 1.3 Batasan Masalah

- **Cabang:** tenis sebagai unit analisis utama (di sanalah konflik abonemen–insidentil terjadi); padel sebagai pembanding struktur tarif. Kolam renang dan tiket masuk hanya dipakai untuk menguji generalitas kerangka pengukuran, tidak dioptimasi.
- **Periode data:** `[ISI: bulan–bulan, minimal 3–6 bulan transaksi]`.
- **Evaluasi bersifat offline** (backtesting/replay kontrafaktual). Uji A/B pada operasi berjalan **tidak** dilakukan karena berisiko terhadap pendapatan venue dan hubungan dengan pelanggan.
- **Tidak diteliti:** estimasi elastisitas harga penuh melalui eksperimen harga, model pilihan konsumen (*discrete choice*) tereksplisit, perilaku kompetitor, integrasi payment gateway nyata (sistem memakai gateway dummy), serta peramalan jangka panjang di luar horizon data.
- Aspek keamanan, arsitektur, dan rekayasa perangkat lunak sistem dianggap sebagai konteks artefak, bukan objek penelitian.

## 1.4 Tujuan Penelitian

**Tujuan umum:** menghasilkan dan mengevaluasi kebijakan alokasi slot yang menurunkan kanibalisasi pendapatan abonemen pada fasilitas olahraga multi-cabang.

**Tujuan khusus:**
1. Merumuskan dan memvalidasi metrik RevPASH ter-amortisasi untuk kapasitas dengan kontrak prabayar (menjawab RQ1).
2. Mengukur besaran kanibalisasi dan displaced revenue pada data venue nyata (RQ2).
3. Merancang model pagu alokasi dan mengujinya secara kontrafaktual terhadap data historis (RQ3).
4. Mengimplementasikan keduanya sebagai modul kebijakan + dasbor pada sistem berjalan sehingga dapat digunakan pengelola.

## 1.5 Manfaat Penelitian

**Teoritis**
- Memperluas literatur *revenue management* yang selama ini didominasi konteks hotel, restoran, penerbangan, dan tiket event ke konteks **kapasitas berulang berbasis court-hour dengan kontrak langganan** — kombinasi yang belum banyak dibahas.
- Menyediakan operasionalisasi metrik yang menjembatani pendapatan lump-sum prabayar dengan pengukuran yield per unit kapasitas-waktu.

**Praktis**
- Memberi pengelola venue instrumen untuk menetapkan kuota abonemen pada jam prime berdasarkan bukti, bukan intuisi.
- Menyediakan dasbor yang membuat yield per slot terlihat, sehingga keputusan harga dan alokasi dapat dipantau berkelanjutan.

## 1.6 Kontribusi Penelitian

1. **Kontribusi metodologis** — formulasi *amortized RevPASH*: aturan alokasi nilai kontrak prabayar ke court-hour aktual yang dikonsumsi, sehingga yield lintas kanal dapat dibandingkan dalam satu satuan. Menyelesaikan masalah nyata bahwa booking abonemen tercatat bernilai nol.
2. **Kontribusi empiris** — kuantifikasi pertama besaran kanibalisasi pendapatan abonemen pada venue olahraga di Indonesia berdasarkan data transaksi aktual, termasuk profil temporalnya (jam, hari, musim).
3. **Kontribusi model** — kebijakan pagu alokasi (*protection level*) yang diadaptasi dari kontrol inventori RM ke konteks slot berulang mingguan, lengkap dengan trade-off eksplisit antara kenaikan yield dan penurunan layanan abonemen.
4. **Kontribusi artefak** — implementasi kebijakan sebagai aturan yang dapat dieksekusi pada mesin booking beserta dasbor RevPASH; artefak diserahkan dan dievaluasi bersama pengelola.

---

# BAB II — TINJAUAN PUSTAKA

## 2.1 Tabel State of the Art

**Terverifikasi (URL tersedia, metadata sudah dicek):**

| # | Penulis / Sumber | Tahun | Metode | Hasil | Gap terhadap penelitian ini |
|---|---|---|---|---|---|
| 1 | *Capacity Allocation of Game Tickets Using Dynamic Pricing*, **Data** (MDPI) 4(4):141 | 2019 | Dynamic programming + estimasi fungsi permintaan dari data empiris tiket pertandingan | Dynamic pricing menghasilkan pendapatan lebih tinggi dari harga tetap; kapasitas dialokasikan menurut intensitas laga | Objeknya tiket **event sekali pakai**, bukan slot kapasitas berulang; tidak ada produk langganan yang mengunci slot berkali-kali |
| 2 | *Dynamic capacity allocation for group bookings in live entertainment*, **European Journal of Operational Research** | 2020 | Model alokasi kapasitas dinamis; parameter diestimasi dari data transaksi acara olahraga besar | Menunjukkan trade-off alokasi antara pemesanan grup dan individual | Analog dekat (grup vs individual ≈ abonemen vs insidentil), namun pemesanan grup bersifat sekali-datang; abonemen **mengulang slot yang sama tiap minggu selama berminggu-minggu** |
| 3 | *Optimization of dynamic ticket pricing parameters*, **Journal of Revenue and Pricing Management** | 2019 | Model gabungan variable + dynamic pricing berbasis faktor laga, waktu, dan inventori | Menghasilkan harga dinamis optimal per pertandingan | Berfokus pada **harga**, bukan pagu alokasi; tidak menangani kanibalisasi antar-produk milik penjual yang sama |
| 4 | *Data-driven ticket pricing in football: leveraging customer perceived value for revenue optimization*, **Journal of Big Data** | 2026 | Prediksi kehadiran → penyesuaian harga berbasis nilai persepsi pelanggan | Harga adaptif meningkatkan pendapatan sekaligus keterjangkauan | Kembali pada konteks event; metrik kinerja tidak dinormalisasi per unit kapasitas-waktu |

**Landasan klasik yang akan dijadikan kerangka teori** (kanonik di bidangnya; **sitasi lengkap wajib diverifikasi** dari basis data saat menulis BAB II final):
Kimes dkk. — *restaurant revenue management* dan metrik **RevPASH**; Kimes & Chase — *strategic levers of yield management* (kontrol durasi dan kontrol harga); Belobaba — kontrol inventori kursi dan **protection level / EMSR**; Talluri & van Ryzin — *The Theory and Practice of Revenue Management*; Peffers dkk. dan Hevner dkk. — **Design Science Research**; Brooke — **System Usability Scale (SUS)**.

**Slot yang masih harus diisi: 8–10 jurnal terbitan 2021–2026.** Protokol pencarian yang akan dijalankan:

- **Basis data:** Scopus, ScienceDirect, SpringerLink, Emerald Insight, Taylor & Francis, IEEE Xplore; untuk konteks lokal: Garuda/SINTA.
- **String kueri (kombinasikan dengan `AND`/`OR`):**
  `("revenue management" OR "yield management") AND ("sports facility" OR "court booking" OR "leisure facility" OR "fitness")`;
  `("capacity allocation" OR "protection level" OR "booking limit") AND ("subscription" OR "membership" OR "season ticket")`;
  `("revenue cannibalization" OR "demand dilution") AND ("pricing" OR "channel")`;
  `RevPASH OR "revenue per available" AND (utilization OR benchmark)`;
  `("demand unconstraining" OR "censored demand") AND ("revenue management")`.
- **Kriteria inklusi:** terbit 2021–2026; jurnal terindeks/peer-reviewed; ada model kuantitatif atau data empiris; domain kapasitas layanan berbasis waktu.
- **Kriteria eksklusi:** artikel populer/blog vendor; studi tanpa data atau tanpa model; ulasan produk perangkat lunak.
- **Output:** tabel dengan kolom **Penulis | Tahun | Metode | Hasil | Gap** — dan posisi penelitian ini harus terbaca dari kolom Gap.

## 2.2 Landasan Teori

1. **Revenue management pada kapasitas perishable** — kondisi penerapan (kapasitas tetap, permintaan berfluktuasi dan tersegmentasi, produk tidak dapat disimpan, penjualan di muka), semuanya terpenuhi pada venue ini.
2. **Dua tuas yield management: kontrol harga dan kontrol durasi/alokasi.** Penelitian ini berfokus pada tuas kedua — yang justru belum tersentuh pada sistem berjalan.
3. **Protection level dan booking limit** — konsep menyisihkan sebagian kapasitas untuk kelas tarif tinggi. Adaptasi yang diperlukan: pada kasus ini "kelas tarif tinggi" adalah insidentil, dan permintaan tarif rendah (abonemen) datang **lebih awal** serta bersifat kontraktual — kebalikan dari asumsi maskapai.
4. **RevPASH** sebagai metrik normalisasi pendapatan per unit kapasitas-waktu, beserta keterbatasannya ketika pendapatan diterima dalam bentuk lump-sum prabayar.
5. **Unconstraining demand** — koreksi permintaan tercatat yang tersensor oleh keterbatasan kapasitas; wajib dilakukan agar estimasi RQ2 tidak bias ke bawah.
6. **Design Science Research** — kerangka akademik untuk penelitian yang menghasilkan artefak.

## 2.3 Analisis Sistem Sejenis

Perbandingan terhadap platform pemesanan olahraga yang beredar (AYO Indonesia, Ravelin, serta aplikasi venue lain — daftar final `[ISI]`), dengan bukti berupa tangkapan layar struktur tarif yang dilampirkan. Kolom tabel perbandingan:

| Aspek | AYO | Ravelin | Venue X | SportHub (saat ini) | SportHub (usulan) |
|---|---|---|---|---|---|
| Diferensiasi tarif per jam | | | | Dua blok flat (padel) | Zona waktu berbasis permintaan |
| Produk langganan/abonemen | | | | Ada, tanpa pagu slot | Ada, dengan pagu per zona |
| Pagu kuota pada jam prime | | | | Tidak ada | Ada (protection level) |
| Metrik yield per slot | | | | Tidak ada | RevPASH ter-amortisasi |
| Daftar tunggu / permintaan tertolak | | | | Tercatat | Dipakai untuk unconstraining |
| Transparansi harga (anchor/coret) | | | | Harga coret | Harga berbasis aturan |

Temuan yang diharapkan: platform yang ada kuat pada transaksi namun lemah pada **kontrol alokasi dan pengukuran yield** — di situlah celah penelitian ini berdiri.

## 2.4 Kerangka Pemikiran

```
Struktur tarif berjenjang (abonemen < insidentil)
                │
                ▼
Abonemen menempati slot prime tanpa pagu  ──► Okupansi prime oleh kanal yield rendah
                │                                          │
                ▼                                          ▼
Permintaan insidentil tertolak (waiting_list)  ──► DISPLACED REVENUE (RQ2)
                │
                ▼
        Pengukuran: RevPASH ter-amortisasi (RQ1)
                │
                ▼
        Intervensi: pagu alokasi per zona waktu (RQ3)
                │
                ▼
   Backtesting kontrafaktual → ΔRevPASH, Δpendapatan, Δsesi abonemen terlayani
```

---

# BAB III — METODOLOGI PENELITIAN

## 3.1 Metode Penelitian: DSRM

Penelitian menggunakan **Design Science Research Methodology (DSRM)** karena menghasilkan artefak sekaligus pengetahuan — lebih tepat secara akademik dibanding Waterfall/Agile yang merupakan metode pengembangan, bukan metode penelitian.

| Langkah DSRM | Wujud pada penelitian ini | Luaran |
|---|---|---|
| 1. Identifikasi masalah & motivasi | Analisis struktur tarif dan okupansi venue; wawancara pengelola | BAB I |
| 2. Definisi tujuan solusi | Target kenaikan RevPASH dengan batas penurunan layanan abonemen | §1.4, §3.5 |
| 3. Perancangan & pengembangan | Metrik RevPASH ter-amortisasi + model pagu alokasi + implementasi modul | BAB IV |
| 4. Demonstrasi | Penerapan pada data historis venue | BAB IV |
| 5. Evaluasi | Backtesting kontrafaktual + UAT/SUS | BAB V |
| 6. Komunikasi | Tesis + artikel jurnal | — |

## 3.2 Metode Pengumpulan Data

1. **Data transaksi historis** (sumber utama) — ekspor `bookings`, `occupancy_logs`, `waiting_list`, `payments`/`payment_items`, `user_abonemen`, `abonemen_packages`, dan `court_schedules` untuk periode `[ISI]`. Data dianonimkan (identitas pengguna di-*hash*) sebelum analisis.
2. **Wawancara semi-terstruktur** dengan pengelola/operasional (`[ISI]` narasumber) — aturan tak tertulis penjadwalan abonemen, definisi jam prime menurut praktik, toleransi terhadap penolakan member, serta kendala komersial atas usulan pagu.
3. **Observasi operasional** — verifikasi bahwa slot tercatat memang terpakai (menangani *no-show* dan booking manual di luar sistem).
4. **Dokumentasi tarif pembanding** — tangkapan layar dan daftar harga platform sejenis.

**Etika penelitian:** persetujuan tertulis pengelola untuk penggunaan data, anonimisasi, dan penyajian agregat.

## 3.3 Analisis Kebutuhan

**Fungsional**
- F1 — Menghitung RevPASH per court-hour, dengan amortisasi nilai paket abonemen ke sesi yang benar-benar dikonsumsi.
- F2 — Merekonstruksi matriks okupansi `court × tanggal × jam` dan mengklasifikasikannya per kanal (abonemen / insidentil / kosong).
- F3 — Mengestimasi permintaan tak terlayani dari `waiting_list` dan pola pencarian slot, termasuk koreksi *unconstraining*.
- F4 — Menetapkan pagu kuota abonemen per zona waktu dan menegakkannya pada mesin booking.
- F5 — Menjalankan simulasi kontrafaktual atas data historis dengan parameter kebijakan yang dapat diubah.
- F6 — Dasbor: RevPASH per zona, komposisi kanal, dan estimasi displaced revenue.

**Non-fungsional**
- NF1 — Penegakan pagu tidak boleh merusak jaminan anti-*oversell* yang sudah ada (transaksi serializable dengan advisory lock).
- NF2 — Perhitungan RevPASH untuk 1 bulan data selesai `< 3` detik.
- NF3 — Rekonsiliasi: total pendapatan hasil amortisasi harus sama dengan total pendapatan tercatat (selisih ≤ pembulatan rupiah).
- NF4 — Akses dasbor dibatasi peran pengelola.
- NF5 — Aturan pagu dapat dikonfigurasi tanpa mengubah kode.

## 3.4 Rancangan

- **Arsitektur** — modul kebijakan alokasi disisipkan pada lapisan layanan pemesanan (Express + TypeScript + Prisma + PostgreSQL), dasbor pada aplikasi Next.js. Perancangan mengikuti struktur berlapis yang sudah berjalan agar artefak dapat langsung dipakai.
- **Model data** — ERD/skema untuk entitas baru: `allocation_policies` (zona waktu, kuota, cabang, masa berlaku) dan `slot_yield` (hasil amortisasi per court-hour). Skema eksisting yang relevan sudah tersedia (`bookings`, `occupancy_logs`, `waiting_list`, `abonemen_packages`).
- **Use case** — pengelola menetapkan pagu; pengelola menjalankan simulasi; pengelola membaca dasbor RevPASH; member memesan slot (dengan pemeriksaan pagu); pelanggan insidentil memesan slot.
- **Sequence diagram** untuk dua alur kritis: (a) pemesanan + pemeriksaan pagu di dalam transaksi terkunci, dan (b) pembayaran hingga pemenuhan (*fulfillment*) yang memicu pencatatan yield.
- **Algoritme pagu** — penetapan protection level per zona waktu berdasarkan distribusi permintaan insidentil historis dan selisih yield antar kanal; skenario kebijakan yang diuji: (i) tanpa pagu (baseline), (ii) pagu tetap per zona, (iii) pagu adaptif mengikuti permintaan, (iv) pagu + diferensiasi tarif abonemen pada jam prime.

## 3.5 Metode Evaluasi

Evaluasi tidak berhenti pada *black-box testing*. Tiga lapis:

**(1) Backtesting kontrafaktual — penentu utama.**
Data historis diputar ulang (*replay*) melawan setiap skenario kebijakan.

| Metrik | Definisi | Arah yang diharapkan |
|---|---|---|
| RevPASH | Pendapatan ter-amortisasi ÷ court-hour tersedia | naik |
| RevPASH prime | Idem, dibatasi zona prime | naik |
| Total pendapatan | Rupiah pada periode | naik |
| Okupansi | Court-hour terpakai ÷ tersedia | tidak turun berarti |
| Sesi abonemen terlayani | Jumlah sesi yang tetap dapat dipesan | penurunan ≤ ambang yang disepakati pengelola |
| Displaced booking | Permintaan insidentil tertolak | turun |

Uji statistik: perbandingan berpasangan per hari/zona (uji-t berpasangan atau Wilcoxon sesuai normalitas), pelaporan ukuran efek dan selang kepercayaan, serta **analisis sensitivitas** terhadap asumsi konversi permintaan tergeser.

**(2) Evaluasi artefak bersama pengguna.** UAT terhadap pengelola untuk alur penetapan pagu dan pembacaan dasbor, disertai **SUS** (`[ISI]` responden — sasaran ≥ 5 pengelola/staf) dan wawancara singkat tentang keberterimaan kebijakan.

**(3) Verifikasi teknis.** Pengujian unit untuk invarian amortisasi (NF3) dan penegakan pagu di bawah pemesanan bersamaan, serta uji beban ringan untuk NF2.

**Ancaman terhadap validitas dan mitigasinya**
- *Permintaan tersensor* — permintaan yang ditolak tidak seluruhnya tercatat. Mitigasi: `waiting_list` sebagai penanda langsung + metode unconstraining + pelaporan hasil sebagai batas bawah.
- *Asumsi kontrafaktual* — belum tentu slot yang dibebaskan terisi walk-in. Mitigasi: simulasi pada beberapa tingkat konversi (mis. 40%/60%/80%) dan pelaporan rentang, bukan angka tunggal.
- *Respons perilaku* — member bisa berhenti berlangganan bila pagu terasa membatasi. Mitigasi: sertakan skenario churn dan jadikan retensi sebagai kendala, bukan sekadar catatan.
- *Generalisasi* — satu venue. Mitigasi: nyatakan sebagai studi kasus tunggal dan sajikan kerangka agar dapat direplikasi.

## 3.6 Jadwal Penelitian

Rencana 6 bulan (September 2026 – Februari 2027).

| Kegiatan | Sep | Okt | Nov | Des | Jan | Feb |
|---|---|---|---|---|---|---|
| Studi literatur & finalisasi tabel state of the art | ██ | ██ | | | | |
| Pengumpulan data & wawancara pengelola | ██ | ██ | | | | |
| Pembersihan data & rekonstruksi matriks okupansi | | ██ | ██ | | | |
| Perancangan metrik RevPASH ter-amortisasi | | | ██ | | | |
| Perancangan & implementasi model pagu alokasi | | | ██ | ██ | | |
| Implementasi modul & dasbor | | | | ██ | ██ | |
| Backtesting & analisis statistik | | | | | ██ | ██ |
| UAT + SUS | | | | | | ██ |
| Penulisan & sidang | | | ██ | ██ | ██ | ██ |

---

## Yang harus diselesaikan sebelum sidang proposal

1. Ganti seluruh penanda `[ISI]` dengan angka dan nama sebenarnya — terutama periode data dan jumlah bulan transaksi yang tersedia.
2. Lengkapi tabel state of the art menjadi 10–15 baris memakai protokol pencarian di §2.1; **jangan menyalin baris mana pun tanpa membaca sumber aslinya**.
3. Verifikasi sitasi lengkap (penulis, volume, halaman, DOI) untuk landasan klasik di §2.2.
4. Konfirmasi ke pengelola: izin data, definisi jam prime menurut mereka, dan ambang penurunan layanan abonemen yang masih dapat diterima — angka ini menjadi kendala pada RQ3.
5. Lampirkan tangkapan layar tarif pembanding sebagai bukti empiris §2.3.

---

## Sumber terverifikasi

- Capacity Allocation of Game Tickets Using Dynamic Pricing — https://www.mdpi.com/2306-5729/4/4/141
- Dynamic capacity allocation for group bookings in live entertainment — https://www.sciencedirect.com/science/article/abs/pii/S0377221720301351
- Optimization of dynamic ticket pricing parameters — https://link.springer.com/article/10.1057/s41272-018-00183-1
- Data-driven ticket pricing in football — https://link.springer.com/article/10.1186/s40537-026-01384-x
