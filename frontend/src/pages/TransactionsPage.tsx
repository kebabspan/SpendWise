import { Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Card, Input, Modal, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatShortDate, toNumber } from '../utils/format';

const COLORS = ['#5b8cff', '#3ad6b5', '#ff9c6a', '#ffc857', '#c084fc', '#fb7185'];

export function TransactionsPage() {
  const { user } = useAuth();
  const { accounts, categories, transactions, addTransaction, addCategory, addAccount, deleteTransaction } = useFinance();
  const [filters, setFilters] = useState({ categoryId: 'all', type: 'all', accountId: 'all', month: `${new Date().getMonth() + 1}` });
  const [txModal, setTxModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [accountModal, setAccountModal] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const date = new Date(item.date);
      return (
        (filters.categoryId === 'all' || item.categoryId === filters.categoryId) &&
        (filters.type === 'all' || item.type === filters.type) &&
        (filters.accountId === 'all' || item.fromAccountId === filters.accountId) &&
        Number(filters.month) === date.getMonth() + 1
      );
    });
  }, [transactions, filters]);

  const breakdown = filtered
    .filter((item) => item.type === 'EXPENSE')
    .reduce<Array<{ name: string; value: number }>>((acc, item) => {
      const name = item.category?.name || 'Egyéb';
      const existing = acc.find((entry) => entry.name === name);
      if (existing) existing.value += toNumber(item.amount);
      else acc.push({ name, value: toNumber(item.amount) });
      return acc;
    }, []);

  return (
    <div className="stack-xl">
      <div className="row wrap gap-md">
        <Button onClick={() => setTxModal(true)}><Plus size={16} /> Add transaction</Button>
        <Button className="btn-secondary" onClick={() => setCategoryModal(true)}><Plus size={16} /> Add category</Button>
        <Button className="btn-secondary" onClick={() => setAccountModal(true)}><Plus size={16} /> Add account</Button>
      </div>

      <div className="grid-dashboard">
        <Card className="chart-card large">
          <div className="section-head">
            <div>
              <h3>Filters</h3>
              <p>Szűrés hónapra, account-ra, típusra és kategóriára.</p>
            </div>
          </div>
          <div className="grid-4">
            <label><span>Month</span><Select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>{Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}.</option>)}</Select></label>
            <label><span>Type</span><Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="all">All</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option><option value="TRANSFER">Transfer</option></Select></label>
            <label><span>Category</span><Select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}><option value="all">All</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></label>
            <label><span>Account</span><Select value={filters.accountId} onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}><option value="all">All</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select></label>
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-head">
            <div>
              <h3>Category chart</h3>
              <p>Expense share százalékosan.</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={breakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {breakdown.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="chart-card">
        <div className="section-head">
          <div>
            <h3>Transactions</h3>
            <p>Minden mozgás látszik a backendből betöltve.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dátum</th>
                <th>Leírás</th>
                <th>Hely</th>
                <th>Kategória</th>
                <th>Account</th>
                <th>Típus</th>
                <th>Összeg</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{formatShortDate(item.date)}</td>
                  <td>{item.note || '-'}</td>
                  <td>{item.place || '-'}</td>
                  <td>{item.category?.name || '-'}</td>
                  <td>{item.fromAccount?.name || '-'}</td>
                  <td>{item.type}</td>
                  <td className={item.type === 'EXPENSE' ? 'negative' : 'positive'}>
                    {item.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(toNumber(item.amount), user?.currency)}
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => void deleteTransaction(item.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {txModal && <TransactionModal onClose={() => setTxModal(false)} onSubmit={addTransaction} accounts={accounts} categories={categories} />}
      {categoryModal && <CategoryModal onClose={() => setCategoryModal(false)} onSubmit={addCategory} />}
      {accountModal && <AccountModal onClose={() => setAccountModal(false)} onSubmit={addAccount} />}
    </div>
  );
}

function TransactionModal({ onClose, onSubmit, accounts, categories }: any) {
  const [form, setForm] = useState({
    type: 'EXPENSE',
    accountId: accounts[0]?.id || '',
    toAccountId: accounts[1]?.id || '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    categoryId: '',
    description: '',
    place: '',
  });
  const [loading, setLoading] = useState(false);
  const relevantCategories = categories.filter((item: any) => item.type === form.type || (form.type === 'TRANSFER' && item.type === 'EXPENSE'));

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.accountId) {
      alert('Előbb hozz létre egy accountot.');
      return;
    }

    if (form.type === 'TRANSFER' && !form.toAccountId) {
      alert('Transfer esetén kötelező a cél account.');
      return;
    }

    if (form.type === 'TRANSFER' && form.accountId === form.toAccountId) {
      alert('A forrás és cél account nem lehet ugyanaz.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        amount: Number(form.amount),
        description: form.description || undefined,
        place: form.place || undefined,
        date: form.date || undefined,
        type: form.type,
        accountId: form.accountId,
        toAccountId: form.type === 'TRANSFER' ? form.toAccountId : undefined,
        categoryId:
          form.type === 'TRANSFER'
            ? undefined
            : form.categoryId || undefined,
      };

      console.log('TX PAYLOAD:', payload);

      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      console.error('TX ERROR:', error.response?.data || error);
      alert(error.response?.data?.message || 'Nem sikerült a tranzakció mentése.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add transaction" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <div className="grid-2">
          <label><span>Type</span><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option><option value="TRANSFER">Transfer</option></Select></label>
          <label><span>Amount</span><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required /></label>
        </div>
        <div className="grid-2">
          <label><span>Account</span><Select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>{accounts.map((account: any) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select></label>
          {form.type === 'TRANSFER' ? (
            <label><span>To account</span><Select value={form.toAccountId} onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}>{accounts.map((account: any) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select></label>
          ) : (
            <label><span>Category</span><Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">No category</option>{relevantCategories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></label>
          )}
        </div>
        <div className="grid-2">
          <label><span>Date</span><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label><span>Place</span><Input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="Tesco" /></label>
        </div>
        <label><span>Note</span><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mit vettél?" /></label>
        <Button type="submit" loading={loading}>Save transaction</Button>
      </form>
    </Modal>
  );
}

function CategoryModal({ onClose, onSubmit }: any) {
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', color: '#5b8cff', icon: 'tag' });
  return (
    <Modal title="Add category" onClose={onClose}>
      <form className="stack-lg" onSubmit={(e) => { e.preventDefault(); void onSubmit(form).then(onClose); }}>
        <div className="grid-2">
          <label><span>Name</span><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label><span>Type</span><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></Select></label>
        </div>
        <div className="grid-2">
          <label><span>Color</span><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
          <label><span>Icon</span><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
        </div>
        <Button type="submit">Create category</Button>
      </form>
    </Modal>
  );
}

function AccountModal({ onClose, onSubmit }: any) {
  const [form, setForm] = useState({ name: '', balance: 0, color: '#3ad6b5', icon: 'wallet' });
  return (
    <Modal title="Add account" onClose={onClose}>
      <form className="stack-lg" onSubmit={(e) => { e.preventDefault(); void onSubmit({ ...form, balance: Number(form.balance) }).then(onClose); }}>
        <label><span>Account name</span><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label><span>Starting balance</span><Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })} /></label>
        <div className="grid-2">
          <label><span>Color</span><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
          <label><span>Icon</span><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
        </div>
        <Button type="submit">Create account</Button>
      </form>
    </Modal>
  );
}
