import axios from "axios";

/**
 * Ambil pesan error yang ramah dari error apa pun.
 * - Tidak ada response (backend mati / jaringan) → pesan koneksi.
 * - Ada response → pakai `message` dari backend (sudah spesifik per kasus,
 *   mis. 401 "Email atau password salah", 403 "Akun tidak aktif").
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Terjadi kesalahan. Coba lagi.",
): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Tidak bisa terhubung ke server. Periksa koneksi atau pastikan backend aktif.";
    }
    const data = err.response.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }
  return fallback;
}
