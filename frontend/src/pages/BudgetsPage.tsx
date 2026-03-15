import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, toNumber } from '../utils/format';

const MONTHS = ['Január','Február','Március','Április','Május','Június','Július','Augusztus','Szeptember','Október','November','December'];

export function BudgetsPage() {
  const { user } = useAuth();
  const { budgets, categories, transactions, addBudget, deleteBudget } = useFinance();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const now = new Date();

  const monthlyExpenses = useMemo(
    () => transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === 'EXPENSE' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }),
    [transactions, now],
  );

  const currentMonthBudgets = budgets.filter(b => b.month === now.getMonth() + 1 && b.year === now.getFullYear());
  const totalLimit = currentMonthBudgets.reduce((s, b) => s + toNumber(b.limitAmount), 0);
  const totalSpent = monthlyExpenses.reduce((s, t) => s + toNumber(t.amount), 0);
  const totalRemaining = totalLimit - totalSpent;

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      toast.success('Költségkeret törölve.');
    } catch {
      toast.error('Törlés sikertelen.');
    }
  };

  return (
    <div className="stack-xl">
      <div className="page-header">
        <div>
          <h2>Költségkeretek</h2>
          <p className="muted">Állítson be havi kereteket és kövesse nyomon azok teljesítését.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Új keret</Button>
      </div>

      <div className="grid-kpis">
        <Card className="metric-card blue">
          <span>Összes keret</span>
          <strong>{formatCurrency(totalLimit, user?.currency)}</strong>
        </Card>
        <Card className="metric-card red">
          <span>Felhasználva (aktuális hónap)</span>
          <strong>{formatCurrency(totalSpent, user?.currency)}</strong>
        </Card>
        <Card className={`metric-card ${totalRemaining >= 0 ? 'green' : 'red'}`}>
          <span>Fennmaradó keret</span>
          <strong>{formatCurrency(Math.abs(totalRemaining), user?.currency)}{totalRemaining < 0 ? ' (túllépve)' : ''}</strong>
        </Card>
      </div>

      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h3>Keretkövetés</h3>
            <p>A kiadások automatikusan kerülnek levonásra az adott hónap keretéből.</p>
          </div>
        </div>
        <div className="stack-md">
          {budgets.length === 0 && <p className="muted">Még nincs beállított keret. Kattintson az „Új keret" gombra a kezdéshez.</p>}
          {budgets.map((budget) => {
            const budgetExpenses = transactions.filter((t) => {
              const d = new Date(t.date);
              return (
                t.type === 'EXPENSE' &&
                d.getMonth() + 1 === budget.month &&
                d.getFullYear() === budget.year
              );
            });
            const spent = budgetExpenses
              .filter((t) => t.categoryId === budget.categoryId)
              .reduce((s, t) => s + toNumber(t.amount), 0);
            const limit = toNumber(budget.limitAmount);
            const percent = limit > 0 ? (spent / limit) * 100 : 0;
            const isOver = percent > 100;

            return (
              <div key={budget.id} className="budget-item-card">
                <div className="row between wrap gap-md">
                  <div>
                    <strong>{budget.category.name}</strong>
                    <p className="muted">{MONTHS[budget.month - 1]} {budget.year}</p>
                  </div>
                  <div className="row gap-md center">
                    <span className={isOver ? 'negative' : ''}>
                      {formatCurrency(spent, user?.currency)} / {formatCurrency(limit, user?.currency)}
                    </span>
                    <button className="icon-btn danger" onClick={() => handleDelete(budget.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="progress-track" style={{ marginTop: 10 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      background: isOver ? '#ff8a8a' : percent >= 75 ? '#ffc857' : undefined,
                    }}
                  />
                </div>
                <p className={`progress-label ${isOver ? 'negative' : 'muted'}`}>
                  {isOver
                    ? `Túllépve ${Math.round(percent - 100)}%-kal (${formatCurrency(spent - limit, user?.currency)})`
                    : `${Math.round(percent)}% felhasználva`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {open && (
        <BudgetModal
          onClose={() => setOpen(false)}
          categories={categories.filter((c) => c.type === 'EXPENSE')}
          onSubmit={async (d: any) => { await addBudget(d); setOpen(false); toast.success('Költségkeret mentve.'); }}
        />
      )}
    </div>
  );
}

function BudgetModal({ onClose, categories, onSubmit }: any) {
  const now = new Date();
  const [form, setForm] = useState({
    limitAmount: '',
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    categoryId: categories[0]?.id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.categoryId) { setError('Válasszon kategóriát.'); return; }
    const limit = Number(form.limitAmount);
    if (!limit || limit <= 0) { setError('Adjon meg érvényes összeget.'); return; }
    setLoading(true);
    try {
      await onSubmit({ ...form, limitAmount: limit });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ez a keret már létezik erre a hónapra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Új költségkeret" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <label>
          <span>Kategória</span>
          {categories.length === 0 ? (
            <p className="muted" style={{ marginTop: 6 }}>Nincs kiadás típusú kategória. Előbb hozzon létre egyet a Tranzakciók oldalon.</p>
          ) : (
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">– Válasszon –</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          )}
        </label>
        <label>
          <span>Havi limit összege</span>
          <Input
            type="number"
            min="1"
            step="any"
            placeholder="0"
            value={form.limitAmount}
            onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
            required
          />
        </label>
        <div className="grid-2">
          <label>
            <span>Hónap</span>
            <Select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </Select>
          </label>
          <label>
            <span>Év</span>
            <Input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            />
          </label>
        </div>
        {error && <div className="error-box">{error}</div>}
        <Button type="submit" loading={loading}>Keret mentése</Button>
      </form>
    </Modal>
  );
}
