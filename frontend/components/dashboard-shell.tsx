'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { LayoutDashboard, Wallet, Tags, ArrowLeftRight, Target, Settings, LogOut } from 'lucide-react';
import { ReactNode } from 'react';

const items = [
  { href: '/dashboard', label: 'Áttekintés', icon: LayoutDashboard },
  { href: '/dashboard/accounts', label: 'Számlák', icon: Wallet },
  { href: '/dashboard/categories', label: 'Kategóriák', icon: Tags },
  { href: '/dashboard/transactions', label: 'Tranzakciók', icon: ArrowLeftRight },
  { href: '/dashboard/budgets', label: 'Budgetek', icon: Target },
  { href: '/dashboard/settings', label: 'Beállítások', icon: Settings },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border bg-card p-4 shadow-sm">
          <div className="mb-6 px-2">
            <Link href="/" className="text-xl font-semibold">SpendWise</Link>
            <p className="mt-1 text-sm text-muted-foreground">Template-alapú frontend a saját backenddel.</p>
          </div>
          <nav className="space-y-1">
            {items.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-accent', pathname === href && 'bg-primary text-primary-foreground hover:bg-primary')}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <Button
            className="mt-6 w-full bg-destructive text-destructive-foreground"
            onClick={() => {
              clearToken();
              router.push('/signin');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Kijelentkezés
          </Button>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
