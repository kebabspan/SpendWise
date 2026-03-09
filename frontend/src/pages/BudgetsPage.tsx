import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, toNumber } from '../utils/format';

export function BudgetsPage() {
  const { user } = useAuth();
  const { budgets, categories, transactions, addBudget, deleteBudget } = useFinance();
  const [open, setOpen] = useState(false);
  const now = new Date();

  const monthlyExpenses = useMemo(
    () =>
      transactions.filter((item) => {
        const date = new Date(item.date);
        return item.type === 'EXPENSE' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }),
    [transactions],
  );

  const totalLimit = budgets.reduce((sum, item) => sum + toNumber(item.limitAmount), 0);
  const totalSpent = monthlyExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0);

  return (
    <div className="stack-xl">
      <div className="row between wrap gap-md">
        <Card className="metric-card blue"><span>Total budget</span><strong>{formatCurrency(totalLimit, user?.currency)}</strong></Card>
        <Card className="metric-card red"><span>Spent this month</span><strong>{formatCurrency(totalSpent, user?.currency)}</strong></Card>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> Add budget</Button>
      </div>

      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h3>Budget tracking</h3>
            <p>Minden expense automatikusan levonódik a megfelelő kategória limitjéből a frontend számításában.</p>
          </div>
        </div>
        <div className="stack-md">
          {budgets.map((budget) => {
            const spent = monthlyExpenses
              .filter((item) => item.categoryId === budget.categoryId)
              .reduce((sum, item) => sum + toNumber(item.amount), 0);
            const limit = toNumber(budget.limitAmount);
            const percent = limit ? (spent / limit) * 100 : 0;
            return (
              <div key={budget.id} className="budget-item">
                <div className="row between wrap gap-md">
                  <div>
                    <strong>{budget.category.name}</strong>
                    <p>{budget.month}/{budget.year}</p>
                  </div>
                  <div className="row gap-md center">
                    <strong>{formatCurrency(spent, user?.currency)} / {formatCurrency(limit, user?.currency)}</strong>
                    <button className="icon-btn" onClick={() => void deleteBudget(budget.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="progress-track danger">
                  <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
                </div>
                <p className={percent > 100 ? 'negative' : 'muted'}>
                  {percent > 100 ? `Túllépted ${Math.round(percent - 100)}%-kal.` : `${Math.round(percent)}% felhasználva.`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {open && <BudgetModal onClose={() => setOpen(false)} categories={categories.filter((item) => item.type === 'EXPENSE')} onSubmit={addBudget} />}
    </div>
  );
}

function BudgetModal({ onClose, categories, onSubmit }: any) {
  const now = new Date();
  const [form, setForm] = useState({
    limitAmount: 0,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    categoryId: categories[0]?.id || '',
  });
  return (
    <Modal title="Add budget" onClose={onClose}>
      <form className="stack-lg" onSubmit={(e) => { e.preventDefault(); void onSubmit({ ...form, limitAmount: Number(form.limitAmount) }).then(onClose); }}>
        <label><span>Budget limit</span><Input type="number" value={form.limitAmount} onChange={(e) => setForm({ ...form, limitAmount: Number(e.target.value) })} required /></label>
        <div className="grid-2">
          <label><span>Month</span><Input type="number" min={1} max={12} value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} /></label>
          <label><span>Year</span><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></label>
        </div>
        <label><span>Category</span><Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></label>
        <Button type="submit">Save budget</Button>
      </form>
    </Modal>
  );
}
