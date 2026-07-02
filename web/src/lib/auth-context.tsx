"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiGet, apiPost, tokenStore } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  email_verified: boolean;
}

interface RegisterInput {
  email: string;
  phone: string;
  full_name: string;
  password: string;
}

interface AuthTokens {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hidrasi sesi saat reload: kalau ada token, ambil profil.
  useEffect(() => {
    (async () => {
      if (tokenStore.access) {
        try {
          setUser(await apiGet<AuthUser>("/auth/me"));
        } catch {
          tokenStore.clear();
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const d = await apiPost<AuthTokens>("/auth/login", { email, password });
    tokenStore.set(d.accessToken, d.refreshToken);
    setUser(d.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const d = await apiPost<AuthTokens>("/auth/register", input);
    tokenStore.set(d.accessToken, d.refreshToken);
    setUser(d.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", { refresh_token: tokenStore.refresh });
    } catch {
      /* abaikan — tetap clear sisi klien */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
