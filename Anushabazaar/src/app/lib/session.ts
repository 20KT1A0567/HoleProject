import { API_BASE_URL } from "./config";
import type { CustomerSession } from "../types/storefront";

const SESSION_KEY = "anushabazaar.customer.session";
const SESSION_COOKIE = "anushabazaar_customer_session";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
export const SESSION_CLEARED_EVENT = "anushabazaar:session-cleared";
export const SESSION_UPDATED_EVENT = "anushabazaar:session-updated";

let refreshPromise: Promise<CustomerSession | null> | null = null;

const parseSession = (raw: string | null): CustomerSession | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
};

export const readStoredSession = () => {
  if (typeof window === "undefined") return null;

  const cookieMatch = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));

  if (cookieMatch) {
    const rawValue = cookieMatch.slice(`${SESSION_COOKIE}=`.length);
    return parseSession(decodeURIComponent(rawValue));
  }

  const legacySession = parseSession(window.localStorage.getItem(SESSION_KEY));
  if (legacySession) {
    writeStoredSession(legacySession);
  }

  return legacySession;
};

export const writeStoredSession = (session: CustomerSession) => {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(session);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(serialized)}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  window.localStorage.setItem(SESSION_KEY, serialized);
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
};

export const clearStoredSession = () => {
  if (typeof window === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
};

export const isSessionNearExpiry = (session?: CustomerSession | null, bufferMs = 2 * 60 * 1000) => {
  if (!session?.expiresAt) return false;
  return Date.now() >= session.expiresAt - bufferMs;
};

export const refreshCustomerSession = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshCustomerSessionOnce().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

const refreshCustomerSessionOnce = async () => {
  const session = readStoredSession();
  if (!session?.refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/auth/website/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: session.refreshToken,
    }),
  });

  if (!response.ok) {
    clearStoredSession();
    return null;
  }

  const data = await response.json();
  const expiresInSeconds = Number(data?.expiresIn || 0);
  const nextSession: CustomerSession = {
    ...session,
    accessToken: data?.accessToken || data?.jwtToken || session.accessToken,
    refreshToken: data?.refreshToken || session.refreshToken,
    expiresAt: expiresInSeconds > 0 ? Date.now() + expiresInSeconds * 1000 : session.expiresAt,
  };

  writeStoredSession(nextSession);
  return nextSession;
};

export const getActiveAccessToken = async () => {
  let session = readStoredSession();
  if (!session) return null;

  if (isSessionNearExpiry(session)) {
    session = await refreshCustomerSession();
  }

  return session?.accessToken || null;
};
