import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { LoginResponse, User } from '../types';

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  currency?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

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

const TOKEN_KEY = 'finance_tracker_token';
const USER_KEY = 'finance_tracker_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get<User>('/user/me');
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void boot();
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
    await refreshUser();
  };

  const register = async (payload: RegisterPayload) => {
    try {
      await api.post('/auth/register', payload);
      await login({ email: payload.email, password: payload.password });
    } catch (error: any) {
      // Itt láthatod a szerver pontos hibaüzenetét
      console.error("Regisztrációs hiba részletei:", error.response?.data);
      throw error; // Így a komponens is értesül róla
    }
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
    setUser((previous) => ({ ...previous, ...data } as User));
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...data }));
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser, updateProfile }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
