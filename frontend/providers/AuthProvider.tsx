"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/services/api";
import { LoginRequest } from "@/types/api.types";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }

    try {
      const res = await authService.me();
      if (res.authenticated) {
        setToken(storedToken);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
    } catch {
      // Token is invalid or expired
      removeAuthToken();
      setToken(null);
      setIsAuthenticated(false);
    }

    setIsLoading(false);
    return false;
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    } else if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setToken(res.token);
      setIsAuthenticated(true);
      router.replace("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      removeAuthToken();
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      router.replace("/login");
    }
  };

  const logoutAll = async () => {
    setIsLoading(true);
    try {
      await authService.logoutAll();
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      removeAuthToken();
      setToken(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        login,
        logout,
        logoutAll,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
