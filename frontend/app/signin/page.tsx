'use client';

import { Button, Card, Input } from '@/components/ui';
import { apiFetch, setToken } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await apiFetch<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(result.access_token);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Sikertelen bejelentkezés.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.16),_transparent_30%),linear-gradient(to_bottom_right,hsl(var(--background)),hsl(var(--background)),rgba(240,253,244,0.65))] p-4">
      <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] h-80 w-80 rounded-full bg-green-400/20 blur-3xl" />

      <div className="relative w-full max-w-6xl">
        <div className="grid overflow-hidden rounded-[36px] border border-emerald-200/40 bg-card/85 shadow-[0_25px_80px_rgba(16,185,129,0.12)] backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden border-r border-emerald-200/40 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                SpendWise • Smart Finance
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
                Üdv újra a
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                  {' '}SpendWise-ban
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                Jelentkezz be, és folytasd a pénzügyeid tudatos kezelését.
                Kövesd az egyenlegedet, a havi kiadásaidat, a budgetjeidet és a
                legfrissebb tranzakcióidat egy modern fintech felületen.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Elérhető egyenleg</p>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    +12.4%
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight">842 300 Ft</p>
                <p className="mt-2 text-sm text-emerald-600">Stabil növekedés ebben a hónapban</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Bevétel</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">+420 000 Ft</p>
                </div>

                <div className="rounded-3xl border border-red-200/40 bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Kiadás</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-500">-292 000 Ft</p>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">Havi budget</p>
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/40">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  234 000 Ft felhasználva a 300 000 Ft-os keretből
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 md:p-10">
            <Card className="w-full max-w-md border-0 bg-transparent p-0 shadow-none">
              <div className="mb-8">
                <div className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  Bejelentkezés
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Lépj be a fiókodba
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Add meg az adataidat, és nézd meg egy helyen a teljes pénzügyi áttekintésedet.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail cím</label>
                  <Input
                    placeholder="pelda@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-2xl border-emerald-200/50 bg-background/80 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Jelszó</label>
                  <Input
                    placeholder="Add meg a jelszavad"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border-emerald-200/50 bg-background/80 focus-visible:ring-emerald-500"
                  />
                </div>

                <Button
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:from-emerald-600 hover:to-green-700"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? 'Bejelentkezés...' : 'Belépés'}
                </Button>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20">
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p>
                  Nincs még fiókod?{' '}
                  <Link href="/signup" className="font-medium text-emerald-600 hover:underline">
                    Regisztrálj
                  </Link>
                </p>

                <p>
                  <Link href="/" className="hover:text-foreground hover:underline">
                    Vissza a főoldalra
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}