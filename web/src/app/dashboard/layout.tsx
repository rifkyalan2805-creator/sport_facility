import DashboardShell from "@/components/dashboard/DashboardShell";

/**
 * Kerangka + gate login untuk SELURUH /dashboard/*.
 * Konsekuensi: halaman anak tidak boleh membungkus dirinya dengan RequireAuth
 * lagi, dan isinya tidak ada di HTML SSR — verifikasi harus lewat browser
 * dalam keadaan login, bukan curl.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
