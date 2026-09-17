import { createContext, useEffect, useState, type ReactNode } from "react";
import { setAccessToken } from "../api/client";
import client from "../api/client";
import {
  fetchMe,
  login as loginRequest,
  logoutRequest,
  type Session,
} from "../api/auth";

const REFRESH_STORAGE_KEY = "collabera.refreshToken";

type CurrentUserContextValue = {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const CurrentUserContext = createContext<CurrentUserContextValue | null>(
  null,
);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRefresh = localStorage.getItem(REFRESH_STORAGE_KEY);
    if (!storedRefresh) {
      setLoading(false);
      return;
    }

    client
      .post<{ access: string; refresh?: string }>("/auth/refresh/", {
        refresh: storedRefresh,
      })
      .then(async ({ data }) => {
        setAccessToken(data.access);
        if (data.refresh) {
          localStorage.setItem(REFRESH_STORAGE_KEY, data.refresh);
        }
        const me = await fetchMe();
        setSession(me);
      })
      .catch(() => {
        localStorage.removeItem(REFRESH_STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { access, refresh } = await loginRequest(email, password);
    setAccessToken(access);
    localStorage.setItem(REFRESH_STORAGE_KEY, refresh);
    const me = await fetchMe();
    setSession(me);
  }

  function logout() {
    const refresh = localStorage.getItem(REFRESH_STORAGE_KEY);
    if (refresh) {
      logoutRequest(refresh).catch(() => {
        // Best-effort revoke; ignore failures on logout.
      });
    }
    localStorage.removeItem(REFRESH_STORAGE_KEY);
    setAccessToken(null);
    setSession(null);
  }

  return (
    <CurrentUserContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </CurrentUserContext.Provider>
  );
}
