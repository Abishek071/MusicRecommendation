// lib/api.ts
export const API_BASE = "http://192.168.X.X:8000"; // 👈 Replace with your LAN IP (same network as your phone)

type TokenPair = { access: string; refresh: string };

// Generic helper for making API calls
export async function api<T>(
  path: string,
  opts: RequestInit & { auth?: string | null } = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
    ...(opts.auth ? { Authorization: `Bearer ${opts.auth}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.detail || "Request failed");
  return data as T;
}

// ---------- AUTH FUNCTIONS ----------

// Register a new user
export async function register(
  email: string,
  password: string,
  display_name?: string
) {
  return api("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name }),
  });
}

// Log in and get access + refresh tokens
export async function login(email: string, password: string) {
  return api<TokenPair>("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ✅ Fetch current user info (using access token)
export async function me(access: string) {
  return api<{ id: number; email: string; display_name: string | null }>(
    "/api/auth/me/",
    { auth: access }
  );
}
