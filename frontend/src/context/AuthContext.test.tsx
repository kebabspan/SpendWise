import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

const mockUser = { id: 'u1', email: 'test@example.com', name: 'Test', currency: 'HUF', imageUrl: null };

function TestConsumer() {
  const { user, loading, token } = useAuth();
  if (loading) return <div>loading</div>;
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="token">{token ?? 'null'}</span>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('useAuth', () => {
  it('AuthProvider nélkül hibát dob', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function BareConsumer() {
      useAuth();
      return null;
    }
    expect(() => render(<BareConsumer />)).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });

  it('token nélkül user null és loading false lesz', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('érvényes token esetén /user/me-t hív és betölti a profilt', async () => {
    localStorage.setItem('spendwise_token', 'valid-token');
    mockApi.get.mockResolvedValueOnce({ data: mockUser });

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());

    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    expect(mockApi.get).toHaveBeenCalledWith('/user/me');
  });

  it('lejárt token esetén localStorage törlődik és user null marad', async () => {
    localStorage.setItem('spendwise_token', 'expired-token');
    mockApi.get.mockRejectedValueOnce(new Error('401'));

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('spendwise_token')).toBeNull();
  });
});

describe('login és logout', () => {
  function LoginConsumer() {
    const { user, login, logout } = useAuth();
    return (
      <div>
        <span data-testid="user">{user ? user.email : 'null'}</span>
        <button onClick={() => login({ email: 'test@example.com', password: 'pw' })}>login</button>
        <button onClick={logout}>logout</button>
      </div>
    );
  }

  it('login eltárolja a tokent és a user-t', async () => {
    mockApi.get.mockResolvedValue({ data: mockUser });
    mockApi.post.mockResolvedValueOnce({ data: { access_token: 'tok', user: mockUser } });

    render(<AuthProvider><LoginConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('user')).toBeInTheDocument());

    await act(async () => {
      screen.getByText('login').click();
    });

    expect(localStorage.getItem('spendwise_token')).toBe('tok');
    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
  });

  it('logout törli a tokent és user null lesz', async () => {
    localStorage.setItem('spendwise_token', 'tok');
    mockApi.get.mockResolvedValueOnce({ data: mockUser });

    render(<AuthProvider><LoginConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('test@example.com'));

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(localStorage.getItem('spendwise_token')).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('null');
  });
});
