-- ============================================================
--  ADD TABLE news → berita/artikel yang diisi admin lewat CMS
--
--  Sumber data untuk halaman publik /berita dan /berita/[slug]
--  (link "Berita" di Navbar sebelumnya sengaja 404).
--
--  cover_url menyimpan URL publik absolut hasil unggah ke Supabase
--  Storage (POST /api/v1/uploads/content → storage.service.ts),
--  bukan file/base64 — sama seperti users.photo_url. Tipe TEXT
--  karena URL Supabase bisa panjang. NULLABLE: berita boleh tanpa
--  gambar, sisi UI memakai placeholder.
--
--  status memakai enum cms_status yang SUDAH ADA (dipakai pages),
--  jadi draft/published/archived konsisten antar konten.
--
--  published_at dipisah dari created_at: admin bisa menulis draft
--  hari ini dan menerbitkannya minggu depan — urutan di halaman
--  publik memakai tanggal terbit, bukan tanggal dibuat.
--
--  Idempoten — aman dijalankan berulang.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS "news" (
    "id"           UUID           NOT NULL DEFAULT uuid_generate_v4(),
    "slug"         VARCHAR(200)   NOT NULL,
    "title"        VARCHAR(250)   NOT NULL,
    "excerpt"      TEXT,
    "content"      TEXT           NOT NULL,
    "cover_url"    TEXT,
    "cover_alt"    VARCHAR(250),
    "category"     VARCHAR(80)    NOT NULL DEFAULT 'umum',
    "author"       VARCHAR(120),
    "status"       "cms_status"   NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "created_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- Slug dipakai sebagai URL publik → wajib unik.
CREATE UNIQUE INDEX IF NOT EXISTS "news_slug_key" ON "news" ("slug");

-- Query utama halaman publik: status='published' diurut terbaru dulu.
CREATE INDEX IF NOT EXISTS "news_status_published_at_idx"
  ON "news" ("status", "published_at" DESC);

COMMIT;

-- Verifikasi:
-- SELECT id, slug, title, category, status, published_at FROM news ORDER BY created_at DESC LIMIT 20;
-- SELECT count(*) FILTER (WHERE status = 'published') AS terbit FROM news;
