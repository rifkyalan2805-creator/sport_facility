"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const ADMIN_ROLES = ["admin", "superadmin"];

/**
 * Bungkus halaman yang butuh role tertentu. Belum login → /login (?redirect).
 * Login tapi role kurang → dipulangkan ke /dashboard.
 */
export default function RequireRole({
  roles = ADMIN_ROLES,
  children,
}: {
  roles?: string[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = Boolean(user) && roles.includes(user!.role);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!roles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [loading, user, roles, pathname, router]);

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-ink-400">Memuat…</div>
    );
  if (!allowed) return null;
  return <>{children}</>;
}
