import { AlertTriangle, Download, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, ReferenceLine,
} from 'recharts';
import { Button, Card } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, toNumber } from '../utils/format';

export function ReportsPage() {
  const { user } = useAuth();
  const { budgets, transactions, accounts } = useFinance();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear  = now.getFullYear();

  // --- CSV export ---
  const exportCSV = () => {
    const headers = ['Dátum', 'Típus', 'Összeg', 'Kategória', 'Számla', 'Helyszín', 'Megjegyzés'];
    const rows = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((t) => [
        new Date(t.date).toLocaleDateString('hu-HU'),
        t.type === 'INCOME' ? 'Bevétel' : t.type === 'EXPENSE' ? 'Kiadás' : 'Átutalás',
        toNumber(t.amount),
        t.category?.name || '',
        t.fromAccount?.name || '',
        t.place || '',
        t.note || '',
      ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `spendwise_${now.toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // --- Net Worth (utolsó 12 hónap) ---
  const netWorthData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const date = new Date(currentYear, currentMonth - (11 - i), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      // Számoljuk ki az egyenleget úgy, hogy visszafelé nézzük a tranzakciókat
      const txUpToMonth = transactions.filter((t) => new Date(t.date) <= endOfMonth);
      const balance = txUpToMonth.reduce((s, t) => {
        if (t.type === 'INCOME') return s + toNumber(t.amount);
        if (t.type === 'EXPENSE') return s - toNumber(t.amount);
        return s;
      }, 0);
      // Hozzáadjuk a nyitó egyenlegeket (amelyek nem tranzakcióból jönnek)
      const openingBalance = accounts.reduce((s, a) => s + toNumber(a.balance), 0);
      const currentNetChange = transactions.reduce((s, t) => {
        if (t.type === 'INCOME') return s + toNumber(t.amount);
        if (t.type === 'EXPENSE') return s - toNumber(t.amount);
        return s;
      }, 0);
      const approxBalance = openingBalance - currentNetChange + balance;
      return {
        label: date.toLocaleDateString('hu-HU', { month: 'short', year: '2-digit' }),
        nettóVagyon: Math.round(approxBalance),
      };
    });
  }, [transactions, accounts]);

  // --- Előrejelzés ---
  const forecast = useMemo(() => {
    const last3Months = [0, 1, 2].map((offset) => {
      const d = new Date(currentYear, currentMonth - 1 - offset, 1);
      return transactions
        .filter((t) => {
          const td = new Date(t.date);
          return t.type === 'EXPENSE' && td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
        })
        .reduce((s, t) => s + toNumber(t.amount), 0);
    });
    const avgMonthly = last3Months.reduce((s, v) => s + v, 0) / 3;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const spentSoFar = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, t) => s + toNumber(t.amount), 0);
    const projected = (spentSoFar / dayOfMonth) * daysInMonth;
    const diff = projected - avgMonthly;
    return { avgMonthly, projected, diff, dayOfMonth, daysInMonth };
  }, [transactions]);

  // --- Szöveges riportok ---
  const currentExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'EXPENSE' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const prevExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'EXPENSE' && d.getMonth() === prevDate.getMonth() && d.getFullYear() === prevDate.getFullYear();
  });

  const reports: Array<{ title: string; text: string; tone: 'good' | 'warn' | 'bad' }> = [];

  // Kategória összehasonlítás
  const categoryMap = new Map<string, { cur: number; prev: number; name: string }>();
  [...currentExpenses, ...prevExpenses].forEach((t) => {
    const entry = categoryMap.get(t.categoryId || 'other') || { cur: 0, prev: 0, name: t.category?.name ?? 'Egyéb' };
    if (currentExpenses.includes(t)) entry.cur += toNumber(t.amount);
    else entry.prev += toNumber(t.amount);
    categoryMap.set(t.categoryId || 'other', entry);
  });

  categoryMap.forEach((entry) => {
    if (entry.prev > 0 && entry.cur > entry.prev) {
      const diff = Math.round(((entry.cur - entry.prev) / entry.prev) * 100);
      if (diff > 10) reports.push({ title: `${entry.name} – emelkedő tendencia`, text: `${diff}%-kal többet költött ${entry.name.toLowerCase()} kategóriára az előző hónaphoz képest (${formatCurrency(entry.cur, user?.currency)}).`, tone: 'warn' });
    }
    if (entry.prev > 0 && entry.cur < entry.prev * 0.9) {
      const diff = Math.round(((entry.prev - entry.cur) / entry.prev) * 100);
      reports.push({ title: `${entry.name} – megtakarítás`, text: `${diff}%-kal kevesebbet költött ${entry.name.toLowerCase()} kategóriára. Jó munka!`, tone: 'good' });
    }
  });

  // Keret túllépések
  budgets.filter((b) => b.month === currentMonth + 1 && b.year === currentYear).forEach((budget) => {
    const spent = currentExpenses.filter((t) => t.categoryId === budget.categoryId).reduce((s, t) => s + toNumber(t.amount), 0);
    const limit = toNumber(budget.limitAmount);
    if (spent > limit) reports.push({ title: `${budget.category.name} – keret túllépve`, text: `A(z) ${budget.category.name.toLowerCase()} keretet ${formatCurrency(spent - limit, user?.currency)}-vel lépte túl.`, tone: 'bad' });
  });

  // Legköltségesebb nap
  const dailyMap = currentExpenses.reduce<Record<string, number>>((acc, t) => {
    const day = new Date(t.date).toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + toNumber(t.amount);
    return acc;
  }, {});
  const topDay = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];
  if (topDay) reports.push({ title: 'Legtöbbet költött nap', text: `${new Date(topDay[0]).toLocaleDateString('hu-HU')} napon volt a legnagyobb kiadása: ${formatCurrency(topDay[1], user?.currency)}.`, tone: 'warn' });

  return (
    <div className="stack-xl">
      <div className="page-header">
        <div>
          <h2>Riportok & Elemzés</h2>
          <p className="muted">Automatikus megfigyelések, előrejelzés és vagyonkövetés.</p>
        </div>
        <Button className="btn-secondary" onClick={exportCSV}><Download size={16} /> CSV export</Button>
      </div>

      {/* Előrejelzés kártya */}
      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h3>Havi kiadás előrejelzés</h3>
            <p>Az eddigi tempó alapján becsült havi végösszeg.</p>
          </div>
        </div>
        <div className="forecast-grid">
          <div className="forecast-item">
            <span>Átlag (utolsó 3 hónap)</span>
            <strong>{formatCurrency(forecast.avgMonthly, user?.currency)}</strong>
          </div>
          <div className="forecast-item">
            <span>Hónap előrejelzés</span>
            <strong>{formatCurrency(forecast.projected, user?.currency)}</strong>
          </div>
          <div className={`forecast-item ${forecast.diff > 0 ? 'warn' : 'good'}`}>
            <span>Eltérés az átlagtól</span>
            <strong className={forecast.diff > 0 ? 'negative' : 'positive'}>
              {forecast.diff > 0 ? '+' : ''}{formatCurrency(Math.abs(forecast.diff), user?.currency)}
            </strong>
          </div>
          <div className="forecast-item">
            <span>Hónap előrehaladása</span>
            <strong>{forecast.dayOfMonth} / {forecast.daysInMonth} nap</strong>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#9eb0d0' }}>
          {/* BUG FIX: ha avgMonthly = 0, az osztás Infinity-t adna */}
          {forecast.avgMonthly === 0
            ? '📊 Nincs elegendő előzmény az összehasonlításhoz. Rögzítsen tranzakciókat az előző hónapokban.'
            : forecast.diff > forecast.avgMonthly * 0.1
            ? `⚠️ Az eddigi tempóval kb. ${Math.round((forecast.diff / forecast.avgMonthly) * 100)}%-kal többet fog költeni az átlagosnál.`
            : forecast.diff < 0
            ? `✅ Az eddigi tempóval kb. ${formatCurrency(Math.abs(forecast.diff), user?.currency)}-vel kevesebbet fog költeni az átlagosnál.`
            : '👍 A kiadások az átlagos szinten mozognak.'}
        </p>
      </Card>

      {/* Net Worth grafikon */}
      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h3>Nettó vagyon alakulása</h3>
            <p>Az utolsó 12 hónap becsült vagyonkövetése a tranzakciók alapján.</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={netWorthData}>
            <defs>
              <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#5b8cff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="label" tick={{ fill: '#8ea2c7', fontSize: 11 }} />
            <YAxis tick={{ fill: '#8ea2c7', fontSize: 11 }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
            <Tooltip
              contentStyle={{ background: '#101b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              formatter={(v) => formatCurrency(v as number, user?.currency)}
            />
            <Area type="monotone" dataKey="nettóVagyon" stroke="#5b8cff" fill="url(#nwFill)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Szöveges riportok */}
      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h3>Automatikus megfigyelések</h3>
            <p>{now.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })} – előző hónappal összehasonlítva.</p>
          </div>
        </div>
        <div className="stack-md">
          {reports.length === 0 && <p className="muted">Nincs elegendő adat. Rögzítsen tranzakciókat és állítson be kereteket.</p>}
          {reports.map((r, i) => (
            <div key={i} className={`report-card ${r.tone}`}>
              <div className="report-icon">
                {r.tone === 'good' ? <TrendingDown size={16} /> : r.tone === 'warn' ? <TrendingUp size={16} /> : <AlertTriangle size={16} />}
              </div>
              <div><strong>{r.title}</strong><p>{r.text}</p></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
