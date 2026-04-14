import { useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Card } from '../components/UI';
import { OnboardingBanner } from '../components/Onboarding';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, toNumber } from '../utils/format';

const COLORS = ['#5b8cff', '#3ad6b5', '#ff9c6a', '#ffc857', '#c084fc', '#fb7185'];
const TX_TYPE_LABEL: Record<string, string> = { INCOME: 'Bevétel', EXPENSE: 'Kiadás', TRANSFER: 'Átutalás' };

type Range = '7d' | '30d' | '6m';
const RANGES: { key: Range; label: string }[] = [
  { key: '7d',  label: '7 nap' },
  { key: '30d', label: '1 hónap' },
  { key: '6m',  label: '6 hónap' },
];

const ONBOARDING_KEY = 'spendwise_onboarding_dismissed';

export function DashboardPage() {
  const { user } = useAuth();
  const { accounts, transactions, budgets, loading } = useFinance();
  const [range, setRange] = useState<Range>('30d');
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === 'true',
  );
  const now = new Date();

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDismissed(true);
  };

  const showOnboarding = !onboardingDismissed && !loading && accounts.length === 0;

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalBalance = accounts.reduce((s, a) => s + toNumber(a.balance), 0);
  const monthlyIncome = monthlyTransactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toNumber(t.amount), 0);
  const monthlyExpenses = monthlyTransactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toNumber(t.amount), 0);

  const spendingTrend = (() => {
    if (range === '7d') {
      return Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - i));
        const start = new Date(date); start.setHours(0,0,0,0);
        const end = new Date(date); end.setHours(23,59,59,999);
        const items = transactions.filter((t) => { const td = new Date(t.date); return td >= start && td <= end; });
        return {
          label: date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
          fullLabel: date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }),
          bevétel: items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toNumber(t.amount), 0),
          kiadás: items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toNumber(t.amount), 0),
        };
      });
    }
    if (range === '30d') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const start = new Date(year, month, day, 0, 0, 0);
        const end   = new Date(year, month, day, 23, 59, 59);
        const items = transactions.filter((t) => { const td = new Date(t.date); return td >= start && td <= end; });
        return {
          label: `${day}.`,
          bevétel: items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toNumber(t.amount), 0),
          kiadás: items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toNumber(t.amount), 0),
        };
      });
    }
    return Array.from({ length: 6 }).map((_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const items = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === date.getMonth() && td.getFullYear() === date.getFullYear();
      });
      return {
        label: date.toLocaleDateString('hu-HU', { month: 'short' }),
        fullLabel: date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' }),
        bevétel: items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toNumber(t.amount), 0),
        kiadás: items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toNumber(t.amount), 0),
      };
    });
  })();

  const categoryBreakdown = monthlyTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce<Array<{ name: string; value: number; color: string }>>((acc, t) => {
      const name = t.category?.name ?? 'Egyéb';
      const ex = acc.find((e) => e.name === name);
      if (ex) ex.value += toNumber(t.amount);
      else acc.push({ name, value: toNumber(t.amount), color: t.category?.color || COLORS[acc.length % COLORS.length] });
      return acc;
    }, []);

  const budgetStatus = budgets
    .filter((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear())
    .map((b) => {
      const spent = monthlyTransactions
        .filter((t) => t.type === 'EXPENSE' && t.categoryId === b.categoryId)
        .reduce((s, t) => s + toNumber(t.amount), 0);
      const limit = toNumber(b.limitAmount);
      return { id: b.id, category: b.category.name, limit, spent, percent: limit ? Math.min((spent / limit) * 100, 100) : 0 };
    });

  return (
    <div className="stack-xl">
      {/* Onboarding banner – csak ha nincs még számla */}
      {showOnboarding && <OnboardingBanner onDismiss={dismissOnboarding} />}

      <div className="grid-kpis">
        <MetricCard label="Teljes egyenleg" value={formatCurrency(totalBalance, user?.currency)} accent="blue" />
        <MetricCard label="Havi bevétel" value={`+${formatCurrency(monthlyIncome, user?.currency)}`} accent="green" />
        <MetricCard label="Havi kiadás" value={`-${formatCurrency(monthlyExpenses, user?.currency)}`} accent="red" />
      </div>

      <div className="grid-dashboard">
        <Card className="chart-card large">
          <div className="section-head">
            <div>
              <h3>Pénzforgalom áttekintése</h3>
              <p>Bevétel és kiadás alakulása a kiválasztott időszakban.</p>
            </div>
            <div className="range-tabs">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  className={`range-tab ${range === r.key ? 'active' : ''}`}
                  onClick={() => setRange(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jelmagyarázat */}
          <div className="cashflow-legend">
            <span className="cashflow-legend-item">
              <span className="cashflow-legend-dot income" />
              Bevétel
            </span>
            <span className="cashflow-legend-item">
              <span className="cashflow-legend-dot expense" />
              Kiadás
            </span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={spendingTrend} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bevételFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3ad6b5" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#3ad6b5" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="kiadásFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ff5c7a" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#ff5c7a" stopOpacity={0.02} />
                </linearGradient>
                <filter id="glowGreen" x="-20%" y="-80%" width="140%" height="300%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3ad6b5" floodOpacity="0.7" />
                </filter>
                <filter id="glowRed" x="-20%" y="-80%" width="140%" height="300%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff5c7a" floodOpacity="0.7" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#7a94bb', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#7a94bb', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}e` : String(v)}
                width={42}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(58,214,181,0.2)', strokeWidth: 1, strokeDasharray: '5 4' }}
                contentStyle={{
                  background: 'rgba(10,18,35,0.97)',
                  border: '1px solid rgba(58,214,181,0.3)',
                  borderRadius: 14,
                  padding: '10px 16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                }}
                labelStyle={{ color: '#c4d4f0', fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}
                itemStyle={{ color: '#dce6f8', fontSize: '0.9rem' }}
                formatter={(v: number, name: string) => [
                  formatCurrency(v, user?.currency),
                  name === 'bevétel' ? 'Bevétel' : 'Kiadás',
                ]}
                labelFormatter={(label: string, payload: any[]) => {
                  if (payload?.[0]?.payload?.fullLabel) return payload[0].payload.fullLabel;
                  if (range === '30d') {
                    const monthStr = now.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' });
                    return `${monthStr} ${label}`;
                  }
                  return label;
                }}
              />

              <Area
                type="monotone"
                dataKey="bevétel"
                stroke="#3ad6b5"
                strokeWidth={2.5}
                fill="url(#bevételFill)"
                dot={false}
                activeDot={{ r: 6, fill: '#3ad6b5', stroke: '#0a1223', strokeWidth: 2.5 }}
                style={{ filter: 'url(#glowGreen)' }}
              />
              <Area
                type="monotone"
                dataKey="kiadás"
                stroke="#ff5c7a"
                strokeWidth={2.5}
                fill="url(#kiadásFill)"
                dot={false}
                activeDot={{ r: 6, fill: '#ff5c7a', stroke: '#0a1223', strokeWidth: 2.5 }}
                style={{ filter: 'url(#glowRed)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <div className="section-head">
            <div><h3>Kiadások kategóriánként</h3><p>Az aktuális hónap megoszlása.</p></div>
          </div>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={52} outerRadius={85} paddingAngle={4}>
                    {categoryBreakdown.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#101b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v) => formatCurrency(v as number, user?.currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-list">
                {categoryBreakdown.map((item) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span>{item.name}</span>
                    <strong>{formatCurrency(item.value, user?.currency)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>Nincs kiadás ebben a hónapban.</p>
          )}
        </Card>
      </div>

      <div className="grid-dashboard">
        <Card className="chart-card">
          <div className="section-head">
            <div><h3>Legutóbbi tranzakciók</h3><p>Az utolsó 5 mozgás.</p></div>
          </div>
          <div className="stack-sm">
            {transactions.length === 0 && <p className="muted">Még nincs rögzített tranzakció.</p>}
            {[...transactions]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="tx-row">
                  <div className="tx-info">
                    <strong>{item.category?.name ?? TX_TYPE_LABEL[item.type] ?? item.type}</strong>
                    <span className="muted">{new Date(item.date).toLocaleDateString('hu-HU')}</span>
                  </div>
                  <span className={item.type === 'INCOME' ? 'positive' : item.type === 'EXPENSE' ? 'negative' : ''}>
                    {item.type === 'INCOME' ? '+' : item.type === 'EXPENSE' ? '-' : ''}
                    {formatCurrency(toNumber(item.amount), user?.currency)}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-head">
            <div><h3>Keretállapot</h3><p>Az aktuális hónap kihasználtsága.</p></div>
          </div>
          <div className="stack-sm">
            {budgetStatus.length === 0 && <p className="muted">Nincs beállított keret erre a hónapra.</p>}
            {budgetStatus.map((b) => (
              <div key={b.id} className="budget-mini">
                <div className="row between">
                  <span>{b.category}</span>
                  <span className={b.percent >= 100 ? 'negative' : 'muted'} style={{ fontSize: '0.82rem' }}>
                    {formatCurrency(b.spent, user?.currency)} / {formatCurrency(b.limit, user?.currency)}
                  </span>
                </div>
                <div className="progress-track" style={{ marginTop: 5 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${b.percent}%`,
                      background: b.percent >= 100 ? '#ff5c7a' : b.percent >= 75 ? '#ffc857' : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: 'blue' | 'green' | 'red' }) {
  return (
    <Card className={`metric-card ${accent ?? ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}
