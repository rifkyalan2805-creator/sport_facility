-- ============================================================
--  ADD users.photo_url → foto profil akun
--
--  Menyimpan URL publik absolut hasil unggah ke Supabase Storage
--  (lihat POST /api/v1/uploads/member-photo → storage.service.ts),
--  bukan file/base64. Tipe TEXT karena URL Supabase bisa panjang —
--  sama dengan user_memberships.photo_url.
--
--  Kolom NULLABLE: foto profil bersifat opsional, akun lama belum
--  punya. Sisi UI memakai fallback (inisial nama) bila NULL.
--
--  Catatan: user_memberships.photo_url TETAP ADA dan tidak diganti
--  kolom ini — foto pada member card di-snapshot per membership
--  (boleh berbeda dari foto profil terbaru, mis. kartu lama).
--
--  Idempoten — aman dijalankan berulang.
-- ============================================================

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Backfill: ambil foto dari membership TERBARU milik user tsb
-- sebagai foto profil awal, supaya akun yang sudah pernah daftar
-- membership tidak mulai dari kosong.
UPDATE users u
SET photo_url = m.photo_url
FROM (
  SELECT DISTINCT ON (user_id) user_id, photo_url
  FROM user_memberships
  WHERE photo_url IS NOT NULL
    AND trim(photo_url) <> ''
  ORDER BY user_id, created_at DESC
) m
WHERE u.id = m.user_id
  AND u.photo_url IS NULL;
-- updated_at sengaja TIDAK disentuh: ini migrasi data, bukan
-- perubahan profil oleh user (konsisten dgn db/add_user_nickname.sql).

COMMIT;

-- Verifikasi:
-- SELECT id, full_name, nickname, photo_url FROM users ORDER BY created_at LIMIT 20;
-- SELECT count(*) FILTER (WHERE photo_url IS NULL) AS tanpa_foto FROM users;
