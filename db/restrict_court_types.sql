-- ============================================================
--  RESTRICT COURT TYPES → hanya 'paddle' & 'tennis'
--  Level 2: pembersihan DATA (jalankan manual di pgAdmin/psql)
--
--  Konteks FK pada tabel courts:
--    court_schedules.court_id  → ON DELETE CASCADE  (ikut terhapus)
--    waiting_list.court_id     → ON DELETE CASCADE  (ikut terhapus)
--    occupancy_logs.court_id   → ON DELETE CASCADE  (ikut terhapus)
--    bookings.court_id         → RESTRICT (TANPA cascade) → court yang punya
--                                booking TIDAK bisa di-hard-delete sebelum
--                                booking-nya ditangani.
--  Karena itu, default yang dianjurkan adalah SOFT DELETE.
-- ============================================================

-- ------------------------------------------------------------
-- STEP 0 — INSPEKSI dulu (aman, hanya membaca)
-- ------------------------------------------------------------
SELECT type, count(*) AS jumlah, count(*) FILTER (WHERE is_active) AS aktif
FROM courts
GROUP BY type
ORDER BY type;

-- Lihat lapangan yang akan terdampak (selain paddle/tennis):
SELECT id, name, code, type, is_active
FROM courts
WHERE type NOT IN ('paddle', 'tennis')
ORDER BY type, name;


-- ============================================================
-- OPSI A — SOFT DELETE (DIANJURKAN)
-- Menonaktifkan lapangan non-paddle/tennis. Histori booking,
-- pembayaran, dan laporan tetap utuh. Tidak ada masalah FK.
-- `GET /courts` (publik) hanya menampilkan is_active = true.
-- ============================================================
BEGIN;

UPDATE courts
SET is_active = false,
    updated_at = NOW()
WHERE type NOT IN ('paddle', 'tennis')
  AND is_active = true;

-- Verifikasi sebelum commit:
-- SELECT type, count(*) FILTER (WHERE is_active) AS masih_aktif
-- FROM courts GROUP BY type ORDER BY type;

COMMIT;
-- (ganti COMMIT → ROLLBACK bila ingin membatalkan)


-- ============================================================
-- OPSI B — HARD DELETE (OPSIONAL, DESTRUKTIF)
-- Menghapus permanen lapangan non-paddle/tennis BESERTA booking,
-- jadwal, waiting list, dan occupancy-nya. Tidak bisa di-undo.
-- Pembayaran (payments/payment_items) bersifat polimorfik (tanpa FK
-- ke bookings) → baris pembayaran TIDAK ikut terhapus; tangani manual
-- bila perlu.
--
-- HAPUS TANDA KOMENTAR (/* ... */) HANYA JIKA YAKIN.
-- ============================================================
/*
BEGIN;

-- 1) Hapus booking pada lapangan target lebih dulu (FK RESTRICT).
DELETE FROM bookings b
USING courts c
WHERE b.court_id = c.id
  AND c.type NOT IN ('paddle', 'tennis');

-- 2) Hapus lapangannya. court_schedules / waiting_list / occupancy_logs
--    ikut terhapus otomatis (ON DELETE CASCADE).
DELETE FROM courts
WHERE type NOT IN ('paddle', 'tennis');

-- Verifikasi:
-- SELECT type, count(*) FROM courts GROUP BY type ORDER BY type;

COMMIT;
*/


-- ============================================================
-- CATATAN — ENUM (Level 3, TIDAK dianjurkan)
-- PostgreSQL tidak mendukung `ALTER TYPE court_type DROP VALUE ...`.
-- Untuk benar-benar membuang nilai enum, type harus dibuat ulang dan
-- semua baris yang memakai nilai itu harus sudah tidak ada. Cukup
-- andalkan pembatasan di aplikasi (validator) + soft/hard delete di atas.
-- ============================================================
