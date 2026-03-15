import { Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button, Card, ColorPicker, Input, Modal, Select } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatShortDate, toNumber } from '../utils/format';

const COLORS = ['#5b8cff', '#3ad6b5', '#ff9c6a', '#ffc857', '#c084fc', '#fb7185'];
const MONTHS = ['Január','Február','Március','Április','Május','Június','Július','Augusztus','Szeptember','Október','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

interface EditTxState {
  id: string;
  note: string;
  place: string;
  date: string;
  categoryId: string;
}

export function TransactionsPage() {
  const { user } = useAuth();
  const { accounts, categories, transactions, addTransaction, addCategory, updateCategory, deleteCategory, addAccount, updateTransaction, deleteTransaction } = useFinance();
  const toast = useToast();
  const now = new Date();
  const [filters, setFilters] = useState({
    categoryId: 'all', type: 'all', accountId: 'all',
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear()),
  });
  const [txModal, setTxModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [editTx, setEditTx] = useState<EditTxState | null>(null);

  const filtered = useMemo(() => transactions.filter((item) => {
    const d = new Date(item.date);
    return (
      (filters.categoryId === 'all' || item.categoryId === filters.categoryId) &&
      (filters.type === 'all' || item.type === filters.type) &&
      (filters.accountId === 'all' || item.fromAccountId === filters.accountId || item.toAccountId === filters.accountId) &&
      Number(filters.month) === d.getMonth() + 1 &&
      Number(filters.year) === d.getFullYear()
    );
  }), [transactions, filters]);

  const breakdown = filtered.filter((t) => t.type === 'EXPENSE').reduce<Array<{ name: string; value: number }>>((acc, t) => {
    const name = t.category?.name ?? 'Egyéb';
    const ex = acc.find((e) => e.name === name);
    if (ex) ex.value += toNumber(t.amount); else acc.push({ name, value: toNumber(t.amount) });
    return acc;
  }, []);

  const handleDelete = async (id: string) => {
    try { await deleteTransaction(id); toast.success('Tranzakció törölve.'); }
    catch { toast.error('Törlés sikertelen.'); }
  };

  return (
    <div className="stack-xl">
      <div className="page-header">
        <div><h2>Tranzakciók</h2><p className="muted">Rögzítse és tekintse át pénzforgalmát.</p></div>
        <div className="row wrap gap-md">
          <Button onClick={() => setTxModal(true)}><Plus size={16} /> Új tranzakció</Button>
          <Button className="btn-secondary" onClick={() => setCategoryModal(true)}>Kategóriák</Button>
          <Button className="btn-secondary" onClick={() => setAccountModal(true)}><Plus size={16} /> Számla</Button>
        </div>
      </div>

      <Card className="chart-card">
        <div className="section-head"><div><h3>Szűrők</h3></div></div>
        <div className="filter-grid">
          <label><span>Év</span>
            <Select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </label>
          <label><span>Hónap</span>
            <Select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </Select>
          </label>
          <label><span>Típus</span>
            <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="all">Összes</option>
              <option value="INCOME">Bevétel</option>
              <option value="EXPENSE">Kiadás</option>
              <option value="TRANSFER">Átutalás</option>
            </Select>
          </label>
          <label><span>Kategória</span>
            <Select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
              <option value="all">Összes</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
          <label><span>Számla</span>
            <Select value={filters.accountId} onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}>
              <option value="all">Összes</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          </label>
        </div>
      </Card>

      <div className="grid-dashboard">
        <Card className="chart-card large">
          <div className="section-head">
            <div><h3>Tranzakciók listája</h3><p>{filtered.length} tétel</p></div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Dátum</th><th>Megjegyzés</th><th>Helyszín</th><th>Kategória</th><th>Számla</th><th>Típus</th><th>Összeg</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} className="table-empty">Nincs találat.</td></tr>}
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{formatShortDate(item.date)}</td>
                    <td>{item.note || '–'}</td>
                    <td>{item.place || '–'}</td>
                    <td>{item.category?.name || '–'}</td>
                    <td>{item.fromAccount?.name || '–'}</td>
                    <td><span className={`type-badge type-${item.type.toLowerCase()}`}>
                      {item.type === 'INCOME' ? 'Bevétel' : item.type === 'EXPENSE' ? 'Kiadás' : 'Átutalás'}
                    </span></td>
                    <td className={item.type === 'EXPENSE' ? 'negative' : 'positive'}>
                      {item.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(toNumber(item.amount), user?.currency)}
                    </td>
                    <td>
                      <div className="row gap-md">
                        <button className="icon-btn" title="Szerkesztés" onClick={() => setEditTx({ id: item.id, note: item.note || '', place: item.place || '', date: item.date.slice(0,10), categoryId: item.categoryId || '' })}>
                          <Pencil size={14} />
                        </button>
                        <button className="icon-btn danger" title="Törlés" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-head"><div><h3>Kategória megoszlás</h3><p>Kiadások aránya</p></div></div>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={breakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#8ea2c7', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8ea2c7', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#101b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={(v) => formatCurrency(v as number, user?.currency)} />
                <Bar dataKey="value" radius={[8,8,0,0]}>
                  {breakdown.map((e, i) => <Cell key={e.name} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>Nincs kiadás a kiválasztott időszakban.</p>
          )}
        </Card>
      </div>

      {txModal && <TransactionModal onClose={() => setTxModal(false)} onSubmit={async (p: any) => { await addTransaction(p); toast.success('Tranzakció rögzítve!'); }} accounts={accounts} categories={categories} currency={user?.currency} />}
      {categoryModal && <CategoryManagerModal onClose={() => setCategoryModal(false)} categories={categories} onAdd={async (p: any) => { await addCategory(p); toast.success('Kategória létrehozva!'); }} onUpdate={async (id: string, p: any) => { await updateCategory(id, p); toast.success('Kategória frissítve.'); }} onDelete={async (id: string) => { await deleteCategory(id); toast.success('Kategória törölve.'); }} />}
      {accountModal && <AccountModal onClose={() => setAccountModal(false)} onSubmit={async (p: any) => { await addAccount(p); toast.success('Számla létrehozva!'); }} />}
      {editTx && <EditTransactionModal tx={editTx} categories={categories} onClose={() => setEditTx(null)} onSubmit={async (data: any) => { await updateTransaction(editTx.id, data); toast.success('Tranzakció frissítve.'); setEditTx(null); }} />}
    </div>
  );
}

function TransactionModal({ onClose, onSubmit, accounts, categories, currency: _currency }: any) {
  const now = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({ type: 'EXPENSE', accountId: accounts[0]?.id || '', toAccountId: accounts.length > 1 ? accounts[1].id : '', amount: '', date: now, categoryId: '', description: '', place: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const relevantCats = categories.filter((c: any) => c.type === form.type || form.type === 'TRANSFER');

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    const amount = Number(form.amount);
    if (!amount || amount <= 0) { setError('Adjon meg érvényes összeget.'); return; }
    if (!form.accountId) { setError('Válasszon számlát.'); return; }
    if (form.type === 'TRANSFER') {
      if (!form.toAccountId) { setError('Válasszon cél számlát.'); return; }
      if (form.accountId === form.toAccountId) { setError('A forrás és cél számla nem lehet azonos.'); return; }
    }
    setLoading(true);
    try {
      await onSubmit({ amount, description: form.description || undefined, place: form.place || undefined, date: form.date || undefined, type: form.type, accountId: form.accountId, toAccountId: form.type === 'TRANSFER' ? form.toAccountId : undefined, categoryId: form.type !== 'TRANSFER' && form.categoryId ? form.categoryId : undefined });
      onClose();
    } catch (err: any) { setError(err.response?.data?.message || 'Hiba történt.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Új tranzakció" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <div className="grid-2">
          <label><span>Típus</span>
            <Select value={form.type} onChange={(e) => setForm({...form, type:e.target.value, categoryId:''})}>
              <option value="EXPENSE">Kiadás</option><option value="INCOME">Bevétel</option><option value="TRANSFER">Átutalás</option>
            </Select>
          </label>
          <label><span>Összeg</span>
            <Input type="number" min="0.01" step="any" placeholder="0" value={form.amount} onChange={(e) => setForm({...form, amount:e.target.value})} required />
          </label>
        </div>
        <div className="grid-2">
          <label><span>{form.type==='TRANSFER'?'Forrás számla':'Számla'}</span>
            {accounts.length === 0
              ? <p className="muted" style={{ marginTop:6, fontSize:'0.85rem' }}>Nincs számla. Előbb hozzon létre egyet.</p>
              : <Select value={form.accountId} onChange={(e) => setForm({...form, accountId:e.target.value})}>{accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>}
          </label>
          {form.type==='TRANSFER' ? (
            <label><span>Cél számla</span>
              <Select value={form.toAccountId} onChange={(e) => setForm({...form, toAccountId:e.target.value})}>
                <option value="">– Válasszon –</option>
                {accounts.filter((a: any) => a.id !== form.accountId).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </label>
          ) : (
            <label><span>Kategória</span>
              <Select value={form.categoryId} onChange={(e) => setForm({...form, categoryId:e.target.value})}>
                <option value="">– Válasszon –</option>
                {relevantCats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </label>
          )}
        </div>
        <div className="grid-2">
          <label><span>Dátum</span><Input type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})} /></label>
          <label><span>Helyszín</span><Input value={form.place} onChange={(e) => setForm({...form, place:e.target.value})} placeholder="pl. Tesco" /></label>
        </div>
        <label><span>Megjegyzés</span><Input value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} placeholder="pl. Heti bevásárlás" /></label>
        {error && <div className="error-box">{error}</div>}
        <Button type="submit" loading={loading} disabled={accounts.length === 0}>Mentés</Button>
      </form>
    </Modal>
  );
}

function EditTransactionModal({ tx, categories, onClose, onSubmit }: any) {
  const [form, setForm] = useState({ note: tx.note, place: tx.place, date: tx.date, categoryId: tx.categoryId });
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await onSubmit({ description: form.note, place: form.place, date: form.date, categoryId: form.categoryId || undefined }); }
    finally { setLoading(false); }
  };
  return (
    <Modal title="Tranzakció szerkesztése" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <p className="muted" style={{fontSize:'0.85rem'}}>Az összeg és típus nem módosítható.</p>
        <div className="grid-2">
          <label><span>Dátum</span><Input type="date" value={form.date} onChange={(e) => setForm({...form, date:e.target.value})} /></label>
          <label><span>Kategória</span>
            <Select value={form.categoryId} onChange={(e) => setForm({...form, categoryId:e.target.value})}>
              <option value="">– Nincs –</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
        </div>
        <label><span>Helyszín</span><Input value={form.place} onChange={(e) => setForm({...form, place:e.target.value})} placeholder="pl. Tesco" /></label>
        <label><span>Megjegyzés</span><Input value={form.note} onChange={(e) => setForm({...form, note:e.target.value})} placeholder="pl. Heti bevásárlás" /></label>
        <Button type="submit" loading={loading}>Mentés</Button>
      </form>
    </Modal>
  );
}

function CategoryManagerModal({ onClose, categories, onAdd, onUpdate, onDelete }: any) {
  const [editId, setEditId] = useState<string|null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [addForm, setAddForm] = useState({ name:'', type:'EXPENSE', color:'#5b8cff' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'list'|'add'>('list');
  const startEdit = (c: any) => { setEditId(c.id); setEditName(c.name); setEditColor(c.color||'#5b8cff'); };
  const saveEdit = async () => {
    if (!editId) return; setLoading(true);
    try { await onUpdate(editId, { name: editName, color: editColor }); setEditId(null); } finally { setLoading(false); }
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm('Biztosan törli ezt a kategóriát?')) return; setLoading(true);
    try { await onDelete(id); } finally { setLoading(false); }
  };
  const submitAdd = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await onAdd(addForm); setAddForm({ name:'', type:'EXPENSE', color:'#5b8cff' }); setTab('list'); } finally { setLoading(false); }
  };
  return (
    <Modal title="Kategóriák kezelése" onClose={onClose}>
      <div className="auth-tabs" style={{marginBottom:16}}>
        <button type="button" className={tab==='list'?'active':''} onClick={()=>setTab('list')}>Lista</button>
        <button type="button" className={tab==='add'?'active':''} onClick={()=>setTab('add')}>Új kategória</button>
      </div>
      {tab === 'list' && (
        <div className="stack-md">
          {categories.length === 0 && <p className="muted">Még nincs kategória.</p>}
          {categories.map((c: any) => (
            <div key={c.id} className="category-row">
              {editId === c.id ? (
                <div className="stack-md" style={{flex:1}}>
                  <div className="grid-2">
                    <Input value={editName} onChange={(e)=>setEditName(e.target.value)} />
                    <div style={{display:'flex',gap:8,alignItems:'center'}}><span className="cat-color-preview" style={{background:editColor}} /></div>
                  </div>
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <div className="row gap-md">
                    <Button onClick={saveEdit} loading={loading}>Mentés</Button>
                    <Button className="btn-secondary" onClick={()=>setEditId(null)}>Mégse</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="row gap-md center" style={{flex:1}}>
                    <span className="cat-color-preview" style={{background: c.color||'#5b8cff'}} />
                    <div><strong>{c.name}</strong><p className="muted" style={{fontSize:'0.8rem',margin:0}}>{c.type==='EXPENSE'?'Kiadás':'Bevétel'}</p></div>
                  </div>
                  <div className="row gap-md">
                    <button className="icon-btn" onClick={()=>startEdit(c)}><Pencil size={14}/></button>
                    <button className="icon-btn danger" onClick={()=>handleDelete(c.id)}><Trash2 size={14}/></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {tab === 'add' && (
        <form className="stack-lg" onSubmit={submitAdd}>
          <div className="grid-2">
            <label><span>Megnevezés</span><Input value={addForm.name} onChange={(e)=>setAddForm({...addForm,name:e.target.value})} required placeholder="pl. Élelmiszer" /></label>
            <label><span>Típus</span>
              <Select value={addForm.type} onChange={(e)=>setAddForm({...addForm,type:e.target.value})}>
                <option value="EXPENSE">Kiadás</option><option value="INCOME">Bevétel</option>
              </Select>
            </label>
          </div>
          <label><span>Szín</span><ColorPicker value={addForm.color} onChange={(c)=>setAddForm({...addForm,color:c})} /></label>
          <Button type="submit" loading={loading}>Kategória létrehozása</Button>
        </form>
      )}
    </Modal>
  );
}

function AccountModal({ onClose, onSubmit }: any) {
  const [form, setForm] = useState({ name:'', balance:'', color:'#3ad6b5' });
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await onSubmit({...form, balance: form.balance ? Number(form.balance) : 0}); onClose(); } finally { setLoading(false); }
  };
  return (
    <Modal title="Új számla" onClose={onClose}>
      <form className="stack-lg" onSubmit={submit}>
        <label><span>Számla neve</span><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required placeholder="pl. OTP Bankszámla" /></label>
        <label><span>Nyitó egyenleg</span><Input type="number" min="0" step="any" placeholder="0" value={form.balance} onChange={(e)=>setForm({...form,balance:e.target.value})} /></label>
        <label><span>Szín</span><ColorPicker value={form.color} onChange={(c)=>setForm({...form,color:c})} /></label>
        <Button type="submit" loading={loading}>Számla létrehozása</Button>
      </form>
    </Modal>
  );
}
