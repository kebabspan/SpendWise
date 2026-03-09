import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, toNumber } from '../utils/format';

export function ReportsPage() {
  const { user } = useAuth();
  const { budgets, transactions } = useFinance();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevDate = new Date(currentYear, currentMonth - 1, 1);

  const current = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && item.type === 'EXPENSE';
  });
  const previous = transactions.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === prevDate.getMonth() && date.getFullYear() === prevDate.getFullYear() && item.type === 'EXPENSE';
  });

  const reports: Array<{ title: string; text: string; tone: 'good' | 'warn' | 'bad' }> = [];

  const categoryMap = new Map<string, { current: number; previous: number; name: string }>();
  [...current, ...previous].forEach((item) => {
    const entry = categoryMap.get(item.categoryId || 'other') || { current: 0, previous: 0, name: item.category?.name || 'Egyéb' };
    if (current.includes(item)) entry.current += toNumber(item.amount);
    else entry.previous += toNumber(item.amount);
    categoryMap.set(item.categoryId || 'other', entry);
  });

  categoryMap.forEach((entry) => {
    if (entry.previous > 0 && entry.current > entry.previous) {
      const diff = ((entry.current - entry.previous) / entry.previous) * 100;
      reports.push({
        title: `${entry.name} spending increased`,
        text: `${Math.round(diff)}%-kal többet költöttél ${entry.name.toLowerCase()} kategóriára, mint előző hónapban. (${formatCurrency(entry.current, user?.currency)})`,
        tone: 'warn',
      });
    }
    if (entry.previous > 0 && entry.current < entry.previous) {
      const diff = ((entry.previous - entry.current) / entry.previous) * 100;
      reports.push({
        title: `${entry.name} spending decreased`,
        text: `${Math.round(diff)}%-kal csökkent a ${entry.name.toLowerCase()} költésed az előző hónaphoz képest.`,
        tone: 'good',
      });
    }
  });

  budgets.forEach((budget) => {
    const spent = current
      .filter((item) => item.categoryId === budget.categoryId)
      .reduce((sum, item) => sum + toNumber(item.amount), 0);
    const limit = toNumber(budget.limitAmount);
    if (spent > limit) {
      reports.push({
        title: `${budget.category.name} budget exceeded`,
        text: `A ${budget.category.name.toLowerCase()} budgetedet ${formatCurrency(spent - limit, user?.currency)} összeggel túllépted.`,
        tone: 'bad',
      });
    }
  });

  const dailyCurrent = current.reduce<Record<string, number>>((acc, item) => {
    const day = new Date(item.date).toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + toNumber(item.amount);
    return acc;
  }, {});
  const topDay = Object.entries(dailyCurrent).sort((a, b) => b[1] - a[1])[0];
  if (topDay) {
    reports.push({
      title: 'Highest spending day',
      text: `${new Date(topDay[0]).toLocaleDateString('hu-HU')} napon költöttél a legtöbbet: ${formatCurrency(topDay[1], user?.currency)}.`,
      tone: 'warn',
    });
  }

  return (
    <div className="stack-xl">
      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h3>Automatikus reportok</h3>
            <p>A backendből érkező tranzakciók és budgetek alapján generált megfigyelések.</p>
          </div>
        </div>
        <div className="stack-md">
          {reports.length ? reports.map((report, index) => (
            <div key={`${report.title}-${index}`} className={`report-card ${report.tone}`}>
              <div className="report-icon">
                {report.tone === 'good' ? <TrendingDown size={18} /> : report.tone === 'warn' ? <TrendingUp size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div>
                <strong>{report.title}</strong>
                <p>{report.text}</p>
              </div>
            </div>
          )) : <p className="muted">Még nincs elég adat riport készítéséhez.</p>}
        </div>
      </Card>
    </div>
  );
}
