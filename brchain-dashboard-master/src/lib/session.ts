// Sessao administrativa simples, persistida em sessionStorage.
// Mantemos a logica isolada para que seja facil migrar para JWT/Cookie depois.

const STORAGE_KEY = "brchain:admin-session";

export interface AdminSession {
  userId: string;
  userName: string;
  userRole: "admin" | "user";
  token: string;
}

export function getSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function setSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
