import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, toNumber } from '../utils/format';

const COLORS = ['#5b8cff', '#3ad6b5', '#ff9c6a', '#ffc857', '#c084fc', '#fb7185'];

export function DashboardPage() {
  const { user } = useAuth();
  const { accounts, transactions, budgets } = useFinance();
  const now = new Date();
  const monthlyTransactions = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalBalance = accounts.reduce((sum, item) => sum + toNumber(item.balance), 0);
  const monthlyIncome = monthlyTransactions
    .filter((item) => item.type === 'INCOME')
    .reduce((sum, item) => sum + toNumber(item.amount), 0);
  const monthlyExpenses = monthlyTransactions
    .filter((item) => item.type === 'EXPENSE')
    .reduce((sum, item) => sum + toNumber(item.amount), 0);

  const spendingTrend = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const items = transactions.filter((transaction) => {
      const txDate = new Date(transaction.date);
      return txDate.getMonth() === date.getMonth() && txDate.getFullYear() === date.getFullYear();
    });

    return {
      label: date.toLocaleDateString('hu-HU', { month: 'short' }),
      income: items.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + toNumber(item.amount), 0),
      expense: items.filter((item) => item.type === 'EXPENSE').reduce((sum, item) => sum + toNumber(item.amount), 0),
    };
  });

  const categoryBreakdown = monthlyTransactions
    .filter((item) => item.type === 'EXPENSE')
    .reduce<Array<{ name: string; value: number }>>((acc, item) => {
      const name = item.category?.name || 'Egyéb';
      const existing = acc.find((entry) => entry.name === name);
      if (existing) existing.value += toNumber(item.amount);
      else acc.push({ name, value: toNumber(item.amount) });
      return acc;
    }, []);

  const budgetStatus = budgets.map((budget) => {
    const spent = monthlyTransactions
      .filter((item) => item.type === 'EXPENSE' && item.categoryId === budget.categoryId)
      .reduce((sum, item) => sum + toNumber(item.amount), 0);
    const limit = toNumber(budget.limitAmount);
    return {
      id: budget.id,
      category: budget.category.name,
      limit,
      spent,
      percent: limit ? Math.min((spent / limit) * 100, 100) : 0,
    };
  });

  return (
    <div className="stack-xl">
      <div className="grid-kpis">
        <MetricCard label="Total balance" value={formatCurrency(totalBalance, user?.currency)} accent="blue" />
        <MetricCard label="Monthly income" value={formatCurrency(monthlyIncome, user?.currency)} accent="green" />
        <MetricCard label="Monthly expenses" value={formatCurrency(monthlyExpenses, user?.currency)} accent="red" />
      </div>

      <div className="grid-dashboard">
        <Card className="chart-card large">
          <div className="section-head">
            <div>
              <h3>Spending overview</h3>
              <p>Income vs expense trend in the last 6 months.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={spendingTrend}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#5b8cff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ad6b5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3ad6b5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#5b8cff" fill="url(#incomeFill)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#3ad6b5" fill="url(#expenseFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="chart-card">
          <div className="section-head">
            <div>
              <h3>Expense breakdown</h3>
              <p>This month by categories.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-list">
            {categoryBreakdown.map((item, index) => (
              <div key={item.name} className="legend-item">
                <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
                <span>{item.name}</span>
                <strong>{formatCurrency(item.value, user?.currency)}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid-dashboard">
        <Card className="chart-card large">
          <div className="section-head">
            <div>
              <h3>Recent transactions</h3>
              <p>A gyors áttekintés az utolsó 6 pénzmozgásról.</p>
            </div>
          </div>
          <div className="transaction-list">
            {transactions.slice(0, 6).map((item) => (
              <div key={item.id} className="transaction-row">
                <div>
                  <strong>{item.note || item.place || 'Új tranzakció'}</strong>
                  <p>{item.category?.name || item.type} • {new Date(item.date).toLocaleDateString('hu-HU')}</p>
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
            <div>
              <h3>Budget utilization</h3>
              <p>Automatikusan számolva az aktuális hónap alapján.</p>
            </div>
          </div>
          <div className="stack-md">
            {budgetStatus.length ? budgetStatus.map((item) => (
              <div key={item.id}>
                <div className="row between compact">
                  <strong>{item.category}</strong>
                  <span>{formatCurrency(item.spent, user?.currency)} / {formatCurrency(item.limit, user?.currency)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(item.percent, 100)}%` }} />
                </div>
              </div>
            )) : <p className="muted">Még nincs budget beállítva.</p>}
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
