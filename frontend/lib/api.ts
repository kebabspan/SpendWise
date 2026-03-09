export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export type ApiError = { message?: string | string[] };

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('spendwise_token');
}

export function setToken(token: string) {
  localStorage.setItem('spendwise_token', token);
}

export function clearToken() {
  localStorage.removeItem('spendwise_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiError;
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(message || 'Ismeretlen hiba történt.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
