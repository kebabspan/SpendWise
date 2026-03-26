import { Pencil, Plus, Target, Trash2, PiggyBank } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button, Card, ColorPicker, Input, Modal, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, toNumber } from '../utils/format';
import type { Goal } from '../context/FinanceContext';

export function GoalsPage() {
  const { user } = useAuth();
  const { accounts, goals, addGoal, updateGoal, addToGoal, addTransaction, deleteGoal } = useFinance();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [addMoneyGoal, setAddMoneyGoal] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const totalTarget = goals.reduce((s, g) => s + toNumber(g.targetAmount), 0);
  const totalSaved  = goals.reduce((s, g) => s + toNumber(g.savedAmount), 0);
  const completed   = goals.filter((g) => toNumber(g.savedAmount) >= toNumber(g.targetAmount)).length;

  const handleAddMoney = async (e: FormEvent) => {
    e.preventDefault();
    if (!addMoneyGoal || !amount) return;
    if (!selectedAccountId) { toast.error('Válasszon számlát.'); return; }
    setAddLoading(true);
    try {
      const goalName = goals.find(g => g.id === addMoneyGoal)?.name ?? 'cél';
      await addTransaction({
        amount: Number(amount),
        type: 'EXPENSE',
        accountId: selectedAccountId,
        date: new Date().toISOString().slice(0, 10),
        description: `Befizetés: ${goalName}`,
      });
      await addToGoal(addMoneyGoal, Number(amount));
      setAddMoneyGoal(null);
      setAmount('');
      setSelectedAccountId('');
      toast.success('Befizetés rögzítve!');
    } catch {
      toast.error('Befizetés sikertelen.');
    } finally { setAddLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      toast.success('Cél törölve.');
    } catch {
      toast.error('Törlés sikertelen.');
    }
  };

  return (
    <div className="stack-xl">
      <div className="page-header">
        <div>
          <h2>Pénzügyi célok</h2>
          <p className="muted">Pénzügyi céljai kezelése és nyomon követése.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Új cél</Button>
      </div>

      <div className="grid-kpis">
        <Card className="metric-card blue"><span>Összes célösszeg</span><strong>{formatCurrency(totalTarget, user?.currency)}</strong></Card>
        <Card className="metric-card green"><span>Összegyűjtve</span><strong>{formatCurrency(totalSaved, user?.currency)}</strong></Card>
        <Card className="metric-card blue"><span>Teljesített célok</span><strong>{completed} / {goals.length}</strong></Card>
      </div>

      <div className="goals-grid">
        {goals.length === 0 && (
          <Card className="chart-card" style={{ gridColumn: '1/-1' }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Target size={40} style={{ color: '#5b8cff', margin: '0 auto 12px' }} />
              <p className="muted">Még nincs kitűzött cél. Állítson be egyet és kezdje el a megtakarítást!</p>
            </div>
          </Card>
        )}
        {goals.map((goal) => {
          const saved   = toNumber(goal.savedAmount);
          const target  = toNumber(goal.targetAmount);
          const percent = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
          const done    = saved >= target;
          const daysLeft = goal.deadline
            ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
            : null;

          return (
            <Card key={goal.id} className="goal-card">
              <div className="goal-card__header">
                <div className="goal-icon" style={{ background: goal.color || '#5b8cff' }}>
                  <PiggyBank size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3>{goal.name}</h3>
                  {daysLeft !== null && (
                    <p className={daysLeft < 0 ? 'negative' : 'muted'} style={{ fontSize: '0.8rem', margin: 0 }}>
                      {daysLeft < 0 ? `Lejárt ${Math.abs(daysLeft)} napja` : `${daysLeft} nap maradt`}
                    </p>
                  )}
                </div>
                {done && <span className="goal-done-badge">✓ Teljesítve</span>}
                <button className="icon-btn" title="Szerkesztés" onClick={() => setEditGoal(goal)}><Pencil size={14} /></button>
                <button className="icon-btn danger" onClick={() => handleDelete(goal.id)}><Trash2 size={14} /></button>
              </div>

              <div className="goal-amounts">
                <span>{formatCurrency(saved, user?.currency)}</span>
                <span className="muted">/ {formatCurrency(target, user?.currency)}</span>
              </div>

              <div className="progress-track" style={{ height: 10, marginTop: 10 }}>
                <div className="progress-fill" style={{
                  width: `${percent}%`,
                  background: done ? '#3ad6b5' : goal.color || undefined,
                }} />
              </div>
              <p className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>{Math.round(percent)}% teljesítve</p>

              {!done && (
                <Button
                  className="btn-secondary"
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={() => { setAddMoneyGoal(goal.id); setAmount(''); setSelectedAccountId(accounts[0]?.id || ''); }}
                >
                  <Plus size={14} /> Befizetés
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {addOpen && (
        <GoalFormModal
          onClose={() => setAddOpen(false)}
          onSubmit={async (d) => { await addGoal(d); setAddOpen(false); toast.success('Cél létrehozva!'); }}
        />
      )}

      {editGoal && (
        <GoalFormModal
          initial={editGoal}
          onClose={() => setEditGoal(null)}
          onSubmit={async (d) => { await updateGoal(editGoal.id, d); setEditGoal(null); toast.success('Cél frissítve!'); }}
        />
      )}

      {addMoneyGoal && (
        <Modal title="Befizetés a célba" onClose={() => setAddMoneyGoal(null)}>
          <form className="stack-lg" onSubmit={handleAddMoney}>
            <label><span>Összeg</span>
              <Input type="number" min="1" step="any" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
            </label>
            <label><span>Forrás számla <span className="required-star">*</span></span>
              {accounts.length === 0 ? (
                <p className="muted" style={{ marginTop: 6, fontSize: '0.85rem' }}>Nincs számla. Előbb hozzon létre egyet a Tranzakciók oldalon.</p>
              ) : (
                <Select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} required>
                  <option value="">– Válasszon számlát –</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              )}
            </label>
            <Button type="submit" loading={addLoading} disabled={accounts.length === 0}>Befizetés rögzítése</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function GoalFormModal({
  onClose,
  onSubmit,
  initial,
}: {
  onClose: () => void;
  onSubmit: (d: any) => Promise<void>;
  initial?: Goal;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    targetAmount: initial ? String(toNumber(initial.targetAmount)) : '',
    deadline: initial?.deadline ? initial.deadline.slice(0, 10) : '',
    color: initial?.color ?? '#5b8cff',
  });
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial;

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await onSubmit({
        name: form.name,
        targetAmount: Number(form.targetAmount),
        deadline: form.deadline || undefined,
        color: form.color,
      });
    } finally { setLoading(false); }
  };

  return (
    <Modal title={isEdit ? 'Cél szerkesztése' : 'Új pénzügyi cél'} onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <label><span>Cél neve</span>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="pl. Nyári vakáció" />
        </label>
        <div className="grid-2">
          <label><span>Célösszeg</span>
            <Input type="number" min="1" step="any" placeholder="0" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
          </label>
          <label><span>Határidő (opcionális)</span>
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </label>
        </div>
        <label><span>Szín</span>
          <ColorPicker value={form.color} onChange={(c) => setForm({ ...form, color: c })} />
        </label>
        <Button type="submit" loading={loading}>{isEdit ? 'Mentés' : 'Cél létrehozása'}</Button>
      </form>
    </Modal>
  );
}
