import { Plus, RefreshCw, Pause, Play, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button, Card, ColorPicker, Input, Modal, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, toNumber } from '../utils/format';

const FREQ_LABELS: Record<string, string> = {
  DAILY: 'Naponta', WEEKLY: 'Hetente', MONTHLY: 'Havonta', YEARLY: 'Évente',
};

export function RecurringPage() {
  const { user } = useAuth();
  const { recurring, categories, accounts, addRecurring, updateRecurring, deleteRecurring } = useFinance();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);

  const activeCount   = recurring.filter((r) => r.active).length;
  const monthlyTotal  = recurring
    .filter((r) => r.active && r.type === 'EXPENSE')
    .reduce((s, r) => {
      const amt = toNumber(r.amount);
      if (r.frequency === 'MONTHLY') return s + amt;
      if (r.frequency === 'WEEKLY')  return s + amt * 4.33;
      if (r.frequency === 'YEARLY')  return s + amt / 12;
      return s;
    }, 0);

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await updateRecurring(id, { active: !active });
      toast.success(active ? 'Ismétlődés szüneteltetva.' : 'Ismétlődés aktiválva.');
    } catch {
      toast.error('Módosítás sikertelen.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecurring(id);
      toast.success('Ismétlődés törölve.');
    } catch {
      toast.error('Törlés sikertelen.');
    }
  };

  return (
    <div className="stack-xl">
      <div className="page-header">
        <div>
          <h2>Ismétlődő tranzakciók</h2>
          <p className="muted">Állítson be automatikusan ismétlődő bevételeket és kiadásokat.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Új ismétlődő</Button>
      </div>

      <div className="grid-kpis" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <Card className="metric-card blue"><span>Aktív ismétlődők</span><strong>{activeCount} db</strong></Card>
        <Card className="metric-card red"><span>Becsült havi kiadás</span><strong>{formatCurrency(monthlyTotal, user?.currency)}</strong></Card>
      </div>

      <Card className="chart-card">
        <div className="section-head"><div><h3>Ismétlődő tételek</h3></div></div>
        <div className="stack-md">
          {recurring.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <RefreshCw size={36} style={{ color: '#5b8cff', margin: '0 auto 12px' }} />
              <p className="muted">Még nincs ismétlődő tranzakció. Hozzon létre egyet az albérletnek, Netflixnek, stb.</p>
            </div>
          )}
          {recurring.map((item) => (
            <div key={item.id} className="recurring-row">
              <div className={`recurring-type-dot ${item.type === 'INCOME' ? 'income' : 'expense'}`} />
              <div style={{ flex: 1 }}>
                <strong>{item.name}</strong>
                <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.82rem' }}>
                  {FREQ_LABELS[item.frequency]} • {item.category?.name || '–'} • {item.account?.name || '–'}
                </p>
                <p className="muted" style={{ margin: '1px 0 0', fontSize: '0.78rem' }}>
                  Következő: {new Date(item.nextDate).toLocaleDateString('hu-HU')}
                </p>
              </div>
              <div>
                <strong className={item.type === 'EXPENSE' ? 'negative' : 'positive'}>
                  {item.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(toNumber(item.amount), user?.currency)}
                </strong>
              </div>
              <div className="row gap-md">
                <button
                  className="icon-btn"
                  title={item.active ? 'Szüneteltetés' : 'Aktiválás'}
                  onClick={() => handleToggle(item.id, item.active)}
                >
                  {item.active ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button className="icon-btn danger" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
              {!item.active && <span className="recurring-paused-badge">Szünetel</span>}
            </div>
          ))}
        </div>
      </Card>

      {addOpen && (
        <RecurringFormModal
          categories={categories}
          accounts={accounts}
          onClose={() => setAddOpen(false)}
          onSubmit={async (d: any) => { await addRecurring(d); setAddOpen(false); toast.success('Ismétlődő tranzakció létrehozva!'); }}
        />
      )}
    </div>
  );
}

function RecurringFormModal({ categories, accounts, onClose, onSubmit }: any) {
  const [form, setForm] = useState({
    name: '', amount: '', type: 'EXPENSE', frequency: 'MONTHLY',
    nextDate: new Date().toISOString().slice(0, 10),
    categoryId: '', accountId: accounts[0]?.id || '',
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await onSubmit({
        ...form, amount: Number(form.amount),
        categoryId: form.categoryId || undefined,
        accountId: form.accountId || undefined,
      });
    } finally { setLoading(false); }
  };

  const relevantCats = categories.filter((c: any) => c.type === form.type);

  return (
    <Modal title="Új ismétlődő tranzakció" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <label><span>Megnevezés</span>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="pl. Albérlet, Netflix" />
        </label>
        <div className="grid-2">
          <label><span>Típus</span>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, categoryId: '' })}>
              <option value="EXPENSE">Kiadás</option>
              <option value="INCOME">Bevétel</option>
            </Select>
          </label>
          <label><span>Összeg</span>
            <Input type="number" min="1" step="any" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </label>
        </div>
        <div className="grid-2">
          <label><span>Ismétlődés</span>
            <Select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
              <option value="DAILY">Naponta</option>
              <option value="WEEKLY">Hetente</option>
              <option value="MONTHLY">Havonta</option>
              <option value="YEARLY">Évente</option>
            </Select>
          </label>
          <label><span>Első dátum</span>
            <Input type="date" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })} />
          </label>
        </div>
        <div className="grid-2">
          <label><span>Kategória</span>
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">– Nincs –</option>
              {relevantCats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
          <label><span>Számla</span>
            <Select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
              {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </label>
        </div>
        <Button type="submit" loading={loading}>Létrehozás</Button>
      </form>
    </Modal>
  );
}
