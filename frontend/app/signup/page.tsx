'use client';

import { Button, Card, Input } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'HUF',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setMessage('Sikeres regisztráció. Átirányítás a bejelentkezéshez...');

      setTimeout(() => {
        router.push('/signin');
      }, 800);
    } catch (e: any) {
      setError(e.message || 'Sikertelen regisztráció.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(34,197,94,0.16),_transparent_30%),linear-gradient(to_bottom_right,hsl(var(--background)),hsl(var(--background)),rgba(240,253,244,0.65))] p-4">
      <div className="absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-120px] h-80 w-80 rounded-full bg-green-400/20 blur-3xl" />

      <div className="relative w-full max-w-6xl">
        <div className="grid overflow-hidden rounded-[36px] border border-emerald-200/40 bg-card/85 shadow-[0_25px_80px_rgba(16,185,129,0.12)] backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden border-r border-emerald-200/40 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10 p-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                SpendWise • Personal Finance
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
                Indítsd el a
                <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                  {' '}pénzügyi rendszered
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
                Hozz létre egy fiókot, és kezdd el tudatosabban kezelni a
                bevételeidet, kiadásaidat, kategóriáidat és havi budgetjeidet
                egy modern, átlátható felületen.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-5">
                <p className="text-sm text-muted-foreground">Mi vár rád?</p>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-emerald-200/40 px-4 py-3">
                    <p className="text-sm font-medium">Gyors tranzakció-rögzítés</p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200/40 px-4 py-3">
                    <p className="text-sm font-medium">Átlátható dashboard</p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200/40 px-4 py-3">
                    <p className="text-sm font-medium">Havi budget követés</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Egyszerű</p>
                  <p className="mt-2 text-lg font-semibold">Tiszta felület</p>
                </div>

                <div className="rounded-3xl border border-emerald-200/40 bg-background/80 p-4">
                  <p className="text-sm text-muted-foreground">Hasznos</p>
                  <p className="mt-2 text-lg font-semibold">Valós kontroll</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 md:p-10">
            <Card className="w-full max-w-md border-0 bg-transparent p-0 shadow-none">
              <div className="mb-8">
                <div className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                  Regisztráció
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Készíts új fiókot
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Add meg az adataidat, és kezdd el a pénzügyeid okosabb
                  kezelését a SpendWise segítségével.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Név</label>
                  <Input
                    placeholder="Teljes név"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 rounded-2xl border-emerald-200/50 bg-background/80 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail cím</label>
                  <Input
                    placeholder="pelda@email.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-12 rounded-2xl border-emerald-200/50 bg-background/80 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Jelszó</label>
                  <Input
                    placeholder="Adj meg egy jelszót"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-12 rounded-2xl border-emerald-200/50 bg-background/80 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pénznem</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="h-12 w-full rounded-2xl border border-emerald-200/50 bg-background/80 px-4 text-sm outline-none transition focus:border-emerald-500"
                  >
                    <option value="HUF">HUF - Magyar forint</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>

                <Button
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:from-emerald-600 hover:to-green-700"
                  onClick={handleRegister}
                  disabled={loading}
                >
                  {loading ? 'Fiók létrehozása...' : 'Fiók létrehozása'}
                </Button>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {message}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p>
                  Van már fiókod?{' '}
                  <Link
                    href="/signin"
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    Belépés
                  </Link>
                </p>

                <p>
                  <Link
                    href="/"
                    className="hover:text-foreground hover:underline"
                  >
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