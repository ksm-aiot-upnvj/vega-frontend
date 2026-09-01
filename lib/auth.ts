// ============================================
// VEGA LMS — Auth Utilities
// JWT token management
// ============================================

import type { User, UserRole } from "@/types/user";

const TOKEN_KEY = "vega_token";
const REFRESH_KEY = "vega_refresh_token";
const USER_KEY = "vega_user";

// ---- Token Management ----

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_KEY, token);
}

// ---- User Management ----

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ---- Auth State ----

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUserRole(): UserRole | null {
  const user = getStoredUser();
  return user?.role ?? null;
}

// ---- Logout ----

export function saveAuthData(token: string, refreshToken: string, user: User): void {
  setToken(token);
  setRefreshToken(refreshToken);
  setStoredUser(user);
  
  // Set cookie for middleware
  document.cookie = `vega_token=${token}; path=/; max-age=604800; samesite=lax`;
}

// ---- Logout ----

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  
  // Remove cookie
  document.cookie = `vega_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
