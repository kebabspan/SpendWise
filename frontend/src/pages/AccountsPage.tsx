import { Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button, Card, ColorPicker, Input, Modal } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, toNumber } from '../utils/format';

export function AccountsPage() {
  const { user } = useAuth();
  const { accounts, transactions, addAccount, updateAccount, deleteAccount } = useFinance();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<{ id: string; name: string; color: string } | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + toNumber(a.balance), 0);

  const getAccountStats = (accountId: string) => {
    const now = new Date();
    const thisMonth = transactions.filter((t) => {
      const d = new Date(t.date);
      return (t.fromAccountId === accountId || t.toAccountId === accountId) &&
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const income = thisMonth.filter((t) => t.type === 'INCOME' && t.fromAccountId === accountId)
      .reduce((s, t) => s + toNumber(t.amount), 0);
    const expense = thisMonth.filter((t) => t.type === 'EXPENSE' && t.fromAccountId === accountId)
      .reduce((s, t) => s + toNumber(t.amount), 0);
    return { income, expense, txCount: thisMonth.length };
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Biztosan törli ezt a számlát? Az összes hozzá tartozó tranzakció is törlődik.')) return;
    try {
      await deleteAccount(id);
      toast.success('Számla törölve.');
    } catch {
      toast.error('Törlés sikertelen.');
    }
  };

  return (
    <div className="stack-xl">
      <div className="page-header">
        <div>
          <h2>Számlák</h2>
          <p className="muted">Kezelje bankszámláit, készpénzét és egyéb pénzügyi eszközeit.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Új számla</Button>
      </div>

      <div className="grid-kpis" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <Card className="metric-card blue">
          <span>Összes egyenleg</span>
          <strong>{formatCurrency(totalBalance, user?.currency)}</strong>
        </Card>
        <Card className="metric-card green">
          <span>Számlák száma</span>
          <strong>{accounts.length} db</strong>
        </Card>
      </div>

      <div className="accounts-grid">
        {accounts.length === 0 && (
          <Card className="chart-card" style={{ gridColumn: '1/-1' }}>
            <p className="muted" style={{ textAlign: 'center', padding: '32px' }}>
              Még nincs számla. Kattintson az „Új számla" gombra a kezdéshez.
            </p>
          </Card>
        )}
        {accounts.map((account) => {
          const stats = getAccountStats(account.id);
          const balance = toNumber(account.balance);
          return (
            <Card key={account.id} className="account-card">
              <div className="account-card__header">
                <div className="account-icon" style={{ background: account.color || '#5b8cff' }}>
                  <Wallet size={20} />
                </div>
                <div className="account-card__actions">
                  <button className="icon-btn" onClick={() => setEditAccount({ id: account.id, name: account.name, color: account.color || '#5b8cff' })}>
                    <Pencil size={14} />
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(account.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="account-card__name">{account.name}</h3>
              <div className="account-card__balance" style={{ color: account.color || '#5b8cff' }}>
                {formatCurrency(balance, user?.currency)}
              </div>
              <div className="account-card__stats">
                <div>
                  <span>Havi bevétel</span>
                  <strong className={stats.income > 0 ? 'positive' : ''}>
                    {stats.income > 0 ? '+' : ''}{formatCurrency(stats.income, user?.currency)}
                  </strong>
                </div>
                <div>
                  <span>Havi kiadás</span>
                  <strong className={stats.expense > 0 ? 'negative' : ''}>
                    {stats.expense > 0 ? '-' : ''}{formatCurrency(stats.expense, user?.currency)}
                  </strong>
                </div>
                <div>
                  <span>Tranzakciók</span>
                  <strong>{stats.txCount} db</strong>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {addOpen && (
        <AccountFormModal
          title="Új számla"
          onClose={() => setAddOpen(false)}
          onSubmit={async (data) => { await addAccount(data); setAddOpen(false); toast.success('Számla létrehozva!'); }}
        />
      )}
      {editAccount && (
        <AccountFormModal
          title="Számla szerkesztése"
          initial={editAccount}
          onClose={() => setEditAccount(null)}
          onSubmit={async (data) => { await updateAccount(editAccount.id, data); setEditAccount(null); toast.success('Számla frissítve.'); }}
        />
      )}
    </div>
  );
}

function AccountFormModal({ title, initial, onClose, onSubmit }: {
  title: string;
  initial?: { name: string; color: string };
  onClose: () => void;
  onSubmit: (data: { name: string; balance?: number; color: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(initial?.color || '#5b8cff');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit({ name, balance: balance ? Number(balance) : undefined, color }); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <label><span>Számla neve</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="pl. OTP Bankszámla" />
        </label>
        {!initial && (
          <label><span>Nyitó egyenleg</span>
            <Input type="number" min="0" step="any" placeholder="0" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </label>
        )}
        <label><span>Szín</span>
          <ColorPicker value={color} onChange={setColor} />
        </label>
        <Button type="submit" loading={loading}>Mentés</Button>
      </form>
    </Modal>
  );
}
