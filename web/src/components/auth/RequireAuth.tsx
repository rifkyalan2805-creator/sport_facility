"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Bungkus halaman yang butuh login. Bila belum auth, redirect ke /login
 * sambil menyimpan tujuan (?redirect=) agar bisa kembali setelah login.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-ink-400">
        Memuat…
      </div>
    );
  if (!user) return null;
  return <>{children}</>;
}
