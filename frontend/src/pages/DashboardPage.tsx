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

  // Mutatjuk az onboarding bannert ha: nincs elrejtve ÉS nincs még számla
  const showOnboarding = !onboardingDismissed && !loading && accounts.length === 0;

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalBalance = accounts.reduce((s, a) => s + toNumber(a.balance), 0);
  const monthlyIncome = monthlyTransactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toNumber(t.amount), 0);
  const monthlyExpenses = monthlyTransactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toNumber(t.amount), 0);

  // Grafikon adatok
  const spendingTrend = (() => {
    if (range === '7d') {
      // Utolsó 7 nap, naponta
      return Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - i));
        const start = new Date(date); start.setHours(0,0,0,0);
        const end = new Date(date); end.setHours(23,59,59,999);
        const items = transactions.filter((t) => { const td = new Date(t.date); return td >= start && td <= end; });
        return {
          label: date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
          bevétel: items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toNumber(t.amount), 0),
          kiadás: items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toNumber(t.amount), 0),
        };
      });
    }
    if (range === '30d') {
      // Az aktuális hónap összes napja (1-től a hónap végéig)
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
    // 6 hónap – havi bontás
    return Array.from({ length: 6 }).map((_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const items = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === date.getMonth() && td.getFullYear() === date.getFullYear();
      });
      return {
        label: date.toLocaleDateString('hu-HU', { month: 'short' }),
        bevétel: items.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toNumber(t.amount), 0),
        kiadás: items.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toNumber(t.amount), 0),
      };
    });
  })();

  const categoryBreakdown = monthlyTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce<Array<{ name: string; value: number }>>((acc, t) => {
      const name = t.category?.name ?? 'Egyéb';
      const ex = acc.find((e) => e.name === name);
      if (ex) ex.value += toNumber(t.amount);
      else acc.push({ name, value: toNumber(t.amount) });
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
        <MetricCard label="Havi bevétel" value={formatCurrency(monthlyIncome, user?.currency)} accent="green" />
        <MetricCard label="Havi kiadás" value={formatCurrency(monthlyExpenses, user?.currency)} accent="red" />
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={spendingTrend}>
              <defs>
                <linearGradient id="bevételFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#5b8cff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="kiadásFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ad6b5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3ad6b5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={{ fill: '#8ea2c7', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8ea2c7', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#101b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                formatter={(v) => formatCurrency(v as number, user?.currency)}
              />
              <Area type="monotone" dataKey="bevétel" stroke="#5b8cff" fill="url(#bevételFill)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="kiadás" stroke="#3ad6b5" fill="url(#kiadásFill)" strokeWidth={2.5} />
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
                    {categoryBreakdown.map((e, i) => <Cell key={e.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#101b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                    formatter={(v) => formatCurrency(v as number, user?.currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend-list">
                {categoryBreakdown.map((item, i) => (
                  <div key={item.name} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{item.name}</span>
                    <strong>{formatCurrency(item.value, user?.currency)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">Nincs kiadás ebben a hónapban.</p>
          )}
        </Card>
      </div>

      <div className="grid-dashboard">
        <Card className="chart-card large">
          <div className="section-head">
            <div><h3>Legutóbbi tranzakciók</h3><p>Az utolsó 6 pénzmozgás gyors áttekintése.</p></div>
          </div>
          <div className="transaction-list">
            {transactions.length === 0
              ? <p className="muted">Még nincs rögzített tranzakció.</p>
              : [...transactions]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 6)
                  .map((item) => (
                    <div key={item.id} className="transaction-row">
                      <div>
                        <strong>{item.note || item.place || 'Tranzakció'}</strong>
                        <p>{item.category?.name ?? TX_TYPE_LABEL[item.type] ?? item.type} • {new Date(item.date).toLocaleDateString('hu-HU')}</p>
                      </div>
                      <strong className={item.type === 'EXPENSE' ? 'negative' : 'positive'}>
                        {item.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(toNumber(item.amount), user?.currency)}
                      </strong>
                    </div>
                  ))}
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-head">
            <div><h3>Keretfelhasználás</h3><p>Aktuális hónap – automatikus számítás.</p></div>
          </div>
          <div className="stack-md">
            {budgetStatus.length === 0
              ? <p className="muted">Nincs beállított keret erre a hónapra.</p>
              : budgetStatus.map((item) => (
                  <div key={item.id}>
                    <div className="row between compact">
                      <strong>{item.category}</strong>
                      <span>{formatCurrency(item.spent, user?.currency)} / {formatCurrency(item.limit, user?.currency)}</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${item.percent}%`,
                          background: item.percent >= 100 ? '#ff8a8a' : item.percent >= 75 ? '#ffc857' : undefined,
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

function MetricCard({ label, value, accent }: { label: string; value: string; accent: 'blue' | 'green' | 'red' }) {
  return (
    <Card className={`metric-card ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}
