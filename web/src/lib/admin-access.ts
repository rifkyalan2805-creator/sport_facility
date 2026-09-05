/**
 * Sumber kebenaran akses panel admin (frontend).
 *
 * Sejajar dengan roleguard di backend: `staff` = reception (akses terbatas),
 * `superadmin` = penuh. `admin` dipertahankan demi kompatibilitas (dipensiunkan,
 * user-nya sudah dimigrasi ke superadmin). `member` bukan admin-tier.
 *
 * Semua keputusan akses UI admin (menu, gate halaman, landing) berasal dari file ini.
 */

/** Role yang boleh masuk area /admin sama sekali. */
export const ADMIN_TIER_ROLES: readonly string[] = ["staff", "admin", "superadmin"];

/** Reception + manajemen. Dipakai halaman yang boleh diakses reception. */
const RECEPTION_AND_UP: readonly string[] = ["staff", "admin", "superadmin"];

/** Hanya manajemen (superadmin; admin dipertahankan utk kompatibilitas). */
const MANAGER_ONLY: readonly string[] = ["admin", "superadmin"];

export interface AdminNavItem {
  href: string;
  label: string;
  /** true → cocok hanya jika pathname sama persis (untuk root "/admin"). */
  exact?: boolean;
  /** Role yang diizinkan melihat menu & membuka halaman ini. */
  roles: readonly string[];
}

/**
 * Menu admin + role yang diizinkan per halaman.
 * Reception (staff): Transaksi, Registrasi Abonemen, dan keempat daftar
 * operasional (Member Kolam, Abonemen Aktif, Insidentil Tenis/Padel).
 * Sisanya manajemen.
 */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { href: "/admin", label: "Overview", exact: true, roles: MANAGER_ONLY },
  { href: "/admin/transaksi", label: "Transaksi", roles: RECEPTION_AND_UP },
  { href: "/admin/abonemen", label: "Registrasi Abonemen", roles: RECEPTION_AND_UP },
  { href: "/admin/member-kolam", label: "Member Kolam", roles: RECEPTION_AND_UP },
  { href: "/admin/abonemen-aktif", label: "Abonemen Aktif", roles: RECEPTION_AND_UP },
  { href: "/admin/insidentil-tenis", label: "Insidentil Tenis", roles: RECEPTION_AND_UP },
  { href: "/admin/insidentil-padel", label: "Insidentil Padel", roles: RECEPTION_AND_UP },
  { href: "/admin/courts", label: "Lapangan", roles: MANAGER_ONLY },
  { href: "/admin/pool", label: "Kolam", roles: MANAGER_ONLY },
  { href: "/admin/pricing", label: "Harga", roles: MANAGER_ONLY },
  { href: "/admin/membership", label: "Paket Membership Kolam", roles: MANAGER_ONLY },
  { href: "/admin/events", label: "Event", roles: MANAGER_ONLY },
  { href: "/admin/waitlist", label: "Antrean", roles: MANAGER_ONLY },
  { href: "/admin/promo", label: "Promo", roles: MANAGER_ONLY },
  { href: "/admin/cms", label: "Konten", roles: MANAGER_ONLY },
  { href: "/admin/settings", label: "Pengaturan", roles: MANAGER_ONLY },
];

/** Apakah role termasuk admin-tier (boleh masuk /admin). */
export function isAdminTier(role: string | null | undefined): boolean {
  return !!role && ADMIN_TIER_ROLES.includes(role);
}

/** Menu yang boleh dilihat oleh sebuah role (kosong jika bukan admin-tier). */
export function navFor(role: string | null | undefined): AdminNavItem[] {
  if (!role) return [];
  return ADMIN_NAV.filter((item) => item.roles.includes(role));
}

/** Cari entri menu paling spesifik yang cocok dengan pathname. */
function matchNav(path: string): AdminNavItem | undefined {
  const exact = ADMIN_NAV.find((n) => n.exact && n.href === path);
  if (exact) return exact;
  return ADMIN_NAV
    .filter((n) => !n.exact && (path === n.href || path.startsWith(n.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/**
 * Apakah `role` boleh membuka `path` di area admin.
 * Path admin tak dikenal → default aman (hanya manajemen).
 */
export function canAccess(role: string | null | undefined, path: string): boolean {
  if (!role) return false;
  const item = matchNav(path);
  if (!item) return MANAGER_ONLY.includes(role);
  return item.roles.includes(role);
}

/** Halaman default setelah masuk /admin, sesuai role. */
export function landingFor(role: string | null | undefined): string {
  // Reception tidak boleh Overview (butuh reports/summary yg 403 di backend).
  if (role === "staff") return "/admin/transaksi";
  return "/admin";
}
