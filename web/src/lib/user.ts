import type { AuthUser } from "./auth-context";

/**
 * Nama sapaan untuk UI: nama panggilan bila ada, kalau tidak kata pertama dari
 * nama lengkap. `nickname` nullable karena akun lama mendaftar sebelum kolom
 * itu ada (lihat db/add_user_nickname.sql), jadi fallback-nya wajib.
 *
 * Dipusatkan di sini supaya navbar, sidebar dashboard, dan sapaan di beranda
 * dashboard tidak menampilkan nama yang berbeda-beda untuk orang yang sama.
 */
export function displayName(
  user?: Pick<AuthUser, "nickname" | "full_name"> | null,
): string {
  if (!user) return "Member";
  const panggilan = user.nickname?.trim();
  if (panggilan) return panggilan;
  return user.full_name?.trim().split(/\s+/)[0] || "Member";
}
