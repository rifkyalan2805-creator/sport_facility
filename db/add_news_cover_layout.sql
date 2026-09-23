-- ============================================================
--  ADD news.cover_layout → susunan tampil cover di kartu sorotan
--
--  Menentukan bagaimana cover ditampilkan di puncak halaman /berita:
--    'landscape' — melebar penuh, judul & ringkasan di bawahnya.
--    'portrait'  — gambar tinggi di satu sisi, teks di sisi lain.
--
--  Nilainya sengaja memakai kosakata ORIENTASI, bukan nama tata letak,
--  supaya form admin bisa mengisinya langsung dari orientasi berkas yang
--  diunggah, tanpa tabel penerjemah di tengah.
--
--  Kenapa disimpan, bukan dideteksi dari gambarnya saat halaman dibuka:
--  mengukur gambar di browser baru selesai setelah berkasnya terunduh,
--  sehingga tata letak sempat melompat di depan pembaca. Disimpan =
--  sudah diketahui sebelum render, dan admin tetap bisa menimpanya
--  (kadang foto potret memang ingin ditampilkan melebar).
--
--  NOT NULL DEFAULT 'landscape': baris lama otomatis tampil persis seperti
--  sebelum kolom ini ada — tidak ada nilai NULL yang perlu ditebak UI.
--
--  VARCHAR + CHECK, bukan enum Postgres: nilainya cuma dua dan tidak
--  dipakai tabel lain, jadi tidak sepadan dengan ongkos CREATE TYPE
--  (bandingkan banners.position yang juga varchar biasa).
--
--  Idempoten — aman dijalankan berulang.
-- ============================================================

BEGIN;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS cover_layout VARCHAR(20) NOT NULL DEFAULT 'landscape';

-- CHECK dipasang terpisah supaya ALTER di atas tetap idempoten.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'news_cover_layout_check'
  ) THEN
    ALTER TABLE news
      ADD CONSTRAINT news_cover_layout_check
      CHECK (cover_layout IN ('landscape', 'portrait'));
    -- catatan: DEFAULT-nya 'landscape' → baris lama tampil seperti sebelumnya.
  END IF;
END $$;

COMMIT;

-- Verifikasi:
-- SELECT slug, cover_layout FROM news ORDER BY created_at DESC LIMIT 20;
