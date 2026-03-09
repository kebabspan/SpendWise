'use client';

import { Button, Card, Input, Select } from '@/components/ui';
import { apiFetch } from '@/lib/api';
import { Account, Budget, Category, Transaction, User } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

function numberValue(value: string | number) {
  return typeof value === 'number' ? value : Number(value);
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiFetch<User>('/user/me'),
      apiFetch<Account[]>('/accounts'),
      apiFetch<Category[]>('/categories'),
      apiFetch<Transaction[]>('/transactions'),
      apiFetch<Budget[]>('/budgets'),
    ])
      .then(([u, a, c, t, b]) => {
        setUser(u); setAccounts(a); setCategories(c); setTransactions(t); setBudgets(b);
      })
      .catch((e) => setError(e.message));
  }, []);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + numberValue(t.amount), 0);
    const expense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + numberValue(t.amount), 0);
    const balance = accounts.reduce((sum, a) => sum + numberValue(a.balance), 0);
    return { income, expense, balance };
  }, [accounts, transactions]);

  return (
    <div className="space-y-6">
      <SectionTitle title={`Szia${user?.name ? `, ${user.name}` : ''}!`} subtitle="Gyors összefoglaló a backend adataidból." />
      {error && <Card className="p-4 text-sm text-destructive">{error}</Card>}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><div className="text-sm text-muted-foreground">Összes egyenleg</div><div className="mt-2 text-3xl font-semibold">{totals.balance.toFixed(2)}</div></Card>
        <Card className="p-5"><div className="text-sm text-muted-foreground">Bevételek</div><div className="mt-2 text-3xl font-semibold">{totals.income.toFixed(2)}</div></Card>
        <Card className="p-5"><div className="text-sm text-muted-foreground">Kiadások</div><div className="mt-2 text-3xl font-semibold">{totals.expense.toFixed(2)}</div></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Legutóbbi tranzakciók</h2>
          <div className="mt-4 space-y-3">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <div className="font-medium">{t.note || t.place || 'Tranzakció'}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString('hu-HU')} · {t.category?.name || t.type}</div>
                </div>
                <div className="font-semibold">{numberValue(t.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Rendszer állapot</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border p-4"><div className="text-sm text-muted-foreground">Számlák</div><div className="mt-1 text-2xl font-semibold">{accounts.length}</div></div>
            <div className="rounded-xl border p-4"><div className="text-sm text-muted-foreground">Kategóriák</div><div className="mt-1 text-2xl font-semibold">{categories.length}</div></div>
            <div className="rounded-xl border p-4"><div className="text-sm text-muted-foreground">Budgetek</div><div className="mt-1 text-2xl font-semibold">{budgets.length}</div></div>
            <div className="rounded-xl border p-4"><div className="text-sm text-muted-foreground">Tranzakciók</div><div className="mt-1 text-2xl font-semibold">{transactions.length}</div></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AccountsPage() {
  const [items, setItems] = useState<Account[]>([]);
  const [form, setForm] = useState({ name: '', balance: '0', color: '#111827', icon: 'wallet' });
  const [error, setError] = useState('');
  const load = () => apiFetch<Account[]>('/accounts').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  return <div className="space-y-6"><SectionTitle title="Számlák" subtitle="Bank, készpénz vagy megtakarítás kezelése." />
    <Card className="p-5"><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Név" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/><Input type="number" placeholder="Egyenleg" value={form.balance} onChange={(e)=>setForm({...form,balance:e.target.value})}/><Input placeholder="Szín" value={form.color} onChange={(e)=>setForm({...form,color:e.target.value})}/><Button onClick={async()=>{try{await apiFetch('/accounts',{method:'POST',body:JSON.stringify({...form,balance:Number(form.balance)})});setForm({name:'',balance:'0',color:'#111827',icon:'wallet'});load();}catch(e:any){setError(e.message)}}}>Új számla</Button></div>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}</Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item)=><Card key={item.id} className="p-5"><div className="flex items-start justify-between"><div><div className="font-semibold">{item.name}</div><div className="text-sm text-muted-foreground">Szín: {item.color || '-'}</div></div><Button className="h-8 bg-destructive px-3 text-xs" onClick={async()=>{await apiFetch(`/accounts/${item.id}`,{method:'DELETE'});load();}}>Törlés</Button></div><div className="mt-4 text-3xl font-semibold">{numberValue(item.balance).toFixed(2)}</div></Card>)}</div></div>;
}

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', color: '#111827', icon: 'tag' });
  const [error, setError] = useState('');
  const load = () => apiFetch<Category[]>('/categories').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  return <div className="space-y-6"><SectionTitle title="Kategóriák" subtitle="Bevétel és kiadás kategóriák kezelése." />
    <Card className="p-5"><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Név" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/><Select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value as 'EXPENSE'|'INCOME'})}><option value="EXPENSE">Kiadás</option><option value="INCOME">Bevétel</option></Select><Input placeholder="Szín" value={form.color} onChange={(e)=>setForm({...form,color:e.target.value})}/><Button onClick={async()=>{try{await apiFetch('/categories',{method:'POST',body:JSON.stringify(form)});setForm({name:'',type:'EXPENSE',color:'#111827',icon:'tag'});load();}catch(e:any){setError(e.message)}}}>Új kategória</Button></div>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}</Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item)=><Card key={item.id} className="p-5"><div className="flex items-start justify-between"><div><div className="font-semibold">{item.name}</div><div className="text-sm text-muted-foreground">{item.type}</div></div><Button className="h-8 bg-destructive px-3 text-xs" onClick={async()=>{await apiFetch(`/categories/${item.id}`,{method:'DELETE'});load();}}>Törlés</Button></div></Card>)}</div></div>;
}

export function TransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ amount: '0', description: '', place: '', date: new Date().toISOString().slice(0,10), type: 'EXPENSE', categoryId: '', accountId: '', toAccountId: '' });
  const [error, setError] = useState('');
  const load = async () => {
    try {
      const [t, a, c] = await Promise.all([apiFetch<Transaction[]>('/transactions'), apiFetch<Account[]>('/accounts'), apiFetch<Category[]>('/categories')]);
      setItems(t); setAccounts(a); setCategories(c);
      if (!form.accountId && a[0]) setForm((f) => ({ ...f, accountId: a[0].id }));
    } catch (e:any) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);
  const filteredCategories = categories.filter((item) => item.type === (form.type === 'INCOME' ? 'INCOME' : 'EXPENSE'));
  return <div className="space-y-6"><SectionTitle title="Tranzakciók" subtitle="A backend transaction endpointjeire kötve." />
    <Card className="p-5"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Input type="number" value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} placeholder="Összeg"/><Input value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Leírás"/><Input value={form.place} onChange={(e)=>setForm({...form,place:e.target.value})} placeholder="Hely"/><Input type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})}/><Select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value as any,categoryId:''})}><option value="EXPENSE">Kiadás</option><option value="INCOME">Bevétel</option><option value="TRANSFER">Átvezetés</option></Select><Select value={form.accountId} onChange={(e)=>setForm({...form,accountId:e.target.value})}><option value="">Válassz számlát</option>{accounts.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}</Select><Select value={form.categoryId} onChange={(e)=>setForm({...form,categoryId:e.target.value})} disabled={form.type==='TRANSFER'}><option value="">Válassz kategóriát</option>{filteredCategories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</Select><Select value={form.toAccountId} onChange={(e)=>setForm({...form,toAccountId:e.target.value})} disabled={form.type!=='TRANSFER'}><option value="">Cél számla</option>{accounts.map((a)=><option key={a.id} value={a.id}>{a.name}</option>)}</Select></div><div className="mt-3"><Button onClick={async()=>{try{await apiFetch('/transactions',{method:'POST',body:JSON.stringify({...form,amount:Number(form.amount),date:new Date(form.date).toISOString(),categoryId:form.categoryId||undefined,toAccountId:form.toAccountId||undefined})});setForm({...form,amount:'0',description:'',place:'',categoryId:'',toAccountId:''});load();}catch(e:any){setError(e.message)}}}>Tranzakció mentése</Button></div>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}</Card>
    <Card className="p-5"><div className="space-y-3">{items.map((item)=><div key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border p-4 md:flex-row md:items-center"><div><div className="font-medium">{item.note || item.place || item.type}</div><div className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString('hu-HU')} · {item.category?.name || '-'} · {item.fromAccount?.name || '-'}</div></div><div className="flex items-center gap-3"><div className="font-semibold">{numberValue(item.amount).toFixed(2)}</div><Button className="h-8 bg-destructive px-3 text-xs" onClick={async()=>{await apiFetch(`/transactions/${item.id}`,{method:'DELETE'});load();}}>Törlés</Button></div></div>)}</div></Card></div>;
}

export function BudgetsPage() {
  const [items, setItems] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ limitAmount: '0', month: String(new Date().getMonth()+1), year: String(new Date().getFullYear()), categoryId: '' });
  const [error, setError] = useState('');
  const load = async () => { try { const [b, c] = await Promise.all([apiFetch<Budget[]>('/budgets'), apiFetch<Category[]>('/categories')]); setItems(b); setCategories(c.filter((item)=>item.type==='EXPENSE')); if (!form.categoryId && c[0]) setForm((f)=>({...f,categoryId:c[0].id})); } catch (e:any) { setError(e.message); } };
  useEffect(() => { load(); }, []);
  return <div className="space-y-6"><SectionTitle title="Budgetek" subtitle="Havi limitek kategóriákhoz." />
    <Card className="p-5"><div className="grid gap-3 md:grid-cols-4"><Input type="number" value={form.limitAmount} onChange={(e)=>setForm({...form,limitAmount:e.target.value})} placeholder="Limit"/><Input type="number" value={form.month} onChange={(e)=>setForm({...form,month:e.target.value})} placeholder="Hónap"/><Input type="number" value={form.year} onChange={(e)=>setForm({...form,year:e.target.value})} placeholder="Év"/><Select value={form.categoryId} onChange={(e)=>setForm({...form,categoryId:e.target.value})}><option value="">Kategória</option>{categories.filter((c)=>c.type==='EXPENSE').map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></div><div className="mt-3"><Button onClick={async()=>{try{await apiFetch('/budgets',{method:'POST',body:JSON.stringify({limitAmount:Number(form.limitAmount),month:Number(form.month),year:Number(form.year),categoryId:form.categoryId})});load();}catch(e:any){setError(e.message)}}}>Budget mentése</Button></div>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}</Card>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item)=><Card key={item.id} className="p-5"><div className="flex items-start justify-between"><div><div className="font-semibold">{item.category.name}</div><div className="text-sm text-muted-foreground">{item.month}/{item.year}</div></div><Button className="h-8 bg-destructive px-3 text-xs" onClick={async()=>{await apiFetch(`/budgets/${item.id}`,{method:'DELETE'});load();}}>Törlés</Button></div><div className="mt-4 text-3xl font-semibold">{numberValue(item.limitAmount).toFixed(2)}</div></Card>)}</div></div>;
}

export function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', currency: 'HUF', password: '' });
  const [message, setMessage] = useState('');
  useEffect(() => { apiFetch<User>('/user/me').then((u)=>{setUser(u); setForm((f)=>({...f,name:u.name || '', currency:u.currency || 'HUF'}));}); }, []);
  return <div className="space-y-6"><SectionTitle title="Beállítások" subtitle="Felhasználói profil frissítése a backend /user/update végpontján." />
    <Card className="p-5"><div className="grid gap-3 md:grid-cols-3"><Input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Név"/><Input value={form.currency} onChange={(e)=>setForm({...form,currency:e.target.value})} placeholder="Pénznem"/><Input type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} placeholder="Új jelszó (opcionális)"/></div><div className="mt-3"><Button onClick={async()=>{const updated = await apiFetch<User>('/user/update',{method:'PATCH',body:JSON.stringify({name:form.name,currency:form.currency,password:form.password || undefined})});setUser(updated);setMessage('Sikeres mentés.');setForm((f)=>({...f,password:''}));}}>Mentés</Button></div>{message && <p className="mt-3 text-sm text-green-600">{message}</p>}</Card>
    <Card className="p-5"><div className="text-sm text-muted-foreground">Bejelentkezett e-mail</div><div className="mt-1 text-lg font-semibold">{user?.email}</div></Card></div>;
}
