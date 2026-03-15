import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { LoginResponse, User } from '../types';

interface RegisterPayload { email: string; password: string; name: string; currency?: string; }
interface LoginPayload { email: string; password: string; }

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: Partial<User> & { password?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'spendwise_token';
const USER_KEY = 'spendwise_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.get<User>('/user/me')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const persistAuth = (payload: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, payload.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setToken(payload.access_token);
    setUser(payload.user);
  };

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    persistAuth(data);
  };

  const register = async (payload: RegisterPayload) => {
    // A register endpoint most már közvetlenül tokent ad vissza
    const { data } = await api.post<LoginResponse>('/auth/register', payload);
    persistAuth(data);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await api.get<User>('/user/me');
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  };

  const updateProfile = async (payload: Partial<User> & { password?: string }) => {
    const { data } = await api.patch<User>('/user/update', payload);
    const updated = { ...user, ...data } as User;
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser, updateProfile }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
