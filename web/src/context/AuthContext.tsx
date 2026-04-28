import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiUrl } from '../utils/apiBase';

export type AuthUser = {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: { displayName: string; avatarUrl: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readErrorMessage(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  return typeof data.message === 'string' ? data.message : res.statusText;
}

function normalizeUser(raw: unknown): AuthUser | null {
  const u = raw as {
    id?: unknown;
    email?: unknown;
    displayName?: unknown;
    avatarUrl?: unknown;
  };
  if (typeof u?.id !== 'number' || typeof u.email !== 'string') return null;
  return {
    id: u.id,
    email: u.email,
    displayName: typeof u.displayName === 'string' ? u.displayName : '',
    avatarUrl: typeof u.avatarUrl === 'string' ? u.avatarUrl : '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(apiUrl('/api/auth/me'), { credentials: 'include' });
      if (!r.ok) {
        setUser(null);
        return;
      }
      const data = (await r.json()) as { user?: AuthUser };
      setUser(normalizeUser(data.user));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      await refresh();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error(await readErrorMessage(r));
    const data = (await r.json()) as { user?: AuthUser };
    setUser(normalizeUser(data.user));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const r = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) throw new Error(await readErrorMessage(r));
    const data = (await r.json()) as { user?: AuthUser };
    setUser(normalizeUser(data.user));
  }, []);

  const logout = useCallback(async () => {
    await fetch(apiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload: { displayName: string; avatarUrl: string }) => {
    const r = await fetch(apiUrl('/api/profile'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (r.status === 404) {
      throw new Error('Profile API not found. Restart the local API server and try again.');
    }
    if (!r.ok) throw new Error(await readErrorMessage(r));
    const data = (await r.json()) as { user?: AuthUser };
    setUser(normalizeUser(data.user));
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, login, register, logout, updateProfile }),
    [user, loading, refresh, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
