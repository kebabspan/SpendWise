'use client';

import { getToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/signin');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return <div className="p-6 text-sm text-muted-foreground">Betöltés...</div>;
  return <>{children}</>;
}
