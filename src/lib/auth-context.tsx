"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { api } from "./api";
import { useBrowserStore } from "./browser-store";
import type { AuthPayload, AuthUser, Role } from "./types";

const STORAGE_KEY = "souk.auth";

type StoredAuth = { user: AuthUser; token: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    role?: Role;
  }) => Promise<void>;
  logout: () => void;
  homeForRole: (role?: Role) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function homeForRole(role?: Role) {
  if (role === "admin") return "/admin";
  if (role === "seller" || role === "seller_staff") return "/seller";
  return "/";
}

function emptySubscribe() {
  return () => {};
}

function clientReady() {
  return true;
}

function serverReady() {
  return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ready = useSyncExternalStore(emptySubscribe, clientReady, serverReady);
  const [stored, setStored] = useBrowserStore<StoredAuth | null>(STORAGE_KEY, null);
  const user = stored?.user ?? null;
  const token = stored?.token ?? null;

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api<AuthPayload>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setStored({ user: data.user, token: data.token });
      return data.user;
    },
    [setStored],
  );

  const register = useCallback(async (input: {
    full_name: string;
    email: string;
    password: string;
    phone: string;
    role?: Role;
  }) => {
    await api("/auth/register", { method: "POST", body: input });
  }, []);

  const logout = useCallback(() => setStored(null), [setStored]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      login,
      register,
      logout,
      homeForRole,
    }),
    [user, token, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
