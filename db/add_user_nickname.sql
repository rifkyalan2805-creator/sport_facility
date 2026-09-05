-- ============================================================
--  ADD users.nickname → "nama panggilan" akun
--
--  Dipakai sebagai keterangan SUBJECT pada tabel-tabel admin
--  (Member Kolam, Abonemen Aktif, Insidentil Tenis/Padel).
--
--  Kolom dibuat NULLABLE dengan sengaja: akun lama belum punya
--  nama panggilan. Registrasi BARU mewajibkannya (divalidasi di
--  aplikasi, lihat src/validators/auth.validator.ts), sedangkan
--  akun lama tetap bisa login dan ditampilkan lewat fallback
--  `nickname ?? full_name` di sisi UI.
--
--  Idempoten — aman dijalankan berulang.
-- ============================================================

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nickname VARCHAR(60);

-- Backfill akun lama: ambil kata pertama dari full_name sebagai
-- tebakan nama panggilan yang wajar (mis. "Rifky Alan" → "Rifky").
UPDATE users
SET nickname = split_part(trim(full_name), ' ', 1)
WHERE nickname IS NULL
  AND trim(coalesce(full_name, '')) <> '';

COMMIT;

-- Verifikasi:
-- SELECT id, full_name, nickname FROM users ORDER BY created_at LIMIT 20;
-- SELECT count(*) FILTER (WHERE nickname IS NULL) AS tanpa_nickname FROM users;

