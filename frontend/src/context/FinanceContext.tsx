import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

export interface Account { id: string; name: string; balance: number | string; color?: string; icon?: string; }
export interface Category { id: string; name: string; type: 'INCOME' | 'EXPENSE'; color?: string; icon?: string; }
export interface Budget { id: string; limitAmount: number | string; month: number; year: number; categoryId: string; category: { name: string }; }
export interface Transaction {
  id: string; amount: number | string; note?: string; place?: string; date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'; categoryId?: string; fromAccountId?: string; toAccountId?: string;
  category?: { name: string }; fromAccount?: { name: string }; toAccount?: { name: string };
}
export interface Goal {
  id: string; name: string; targetAmount: number | string; savedAmount: number | string;
  deadline?: string; color?: string; icon?: string;
}
export interface RecurringTransaction {
  id: string; name: string; amount: number | string; type: 'INCOME' | 'EXPENSE';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'; nextDate: string; active: boolean;
  categoryId?: string; accountId?: string;
  category?: { name: string }; account?: { name: string };
}

interface AddTransactionPayload {
  amount: number; description?: string; place?: string; date?: string;
  type: string; accountId: string; toAccountId?: string; categoryId?: string;
}

interface FinanceContextValue {
  accounts: Account[]; categories: Category[]; budgets: Budget[];
  transactions: Transaction[]; goals: Goal[]; recurring: RecurringTransaction[];
  loading: boolean;
  addAccount: (p: { name: string; balance?: number; color?: string }) => Promise<void>;
  updateAccount: (id: string, p: { name?: string; color?: string }) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCategory: (p: { name: string; type: 'INCOME' | 'EXPENSE'; color?: string }) => Promise<void>;
  updateCategory: (id: string, p: { name?: string; color?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBudget: (p: { limitAmount: number; month: number; year: number; categoryId: string }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addTransaction: (p: AddTransactionPayload) => Promise<void>;
  updateTransaction: (id: string, p: Partial<AddTransactionPayload>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (p: { name: string; targetAmount: number; deadline?: string; color?: string }) => Promise<void>;
  updateGoal: (id: string, p: { name?: string; targetAmount?: number; savedAmount?: number; deadline?: string; color?: string }) => Promise<void>;
  addToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addRecurring: (p: { name: string; amount: number; type: string; frequency: string; nextDate: string; categoryId?: string; accountId?: string }) => Promise<void>;
  updateRecurring: (id: string, p: { active?: boolean; nextDate?: string; amount?: number }) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    try {
      const [a, c, b, t, g, r] = await Promise.all([
        api.get('/accounts').then(r => r.data),
        api.get('/categories').then(r => r.data),
        api.get('/budgets').then(r => r.data),
        api.get('/transactions').then(r => r.data),
        api.get('/goals').then(r => r.data),
        api.get('/recurring').then(r => r.data),
      ]);
      setAccounts(a); setCategories(c); setBudgets(b);
      setTransactions(t); setGoals(g); setRecurring(r);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const addAccount = useCallback(async (p: any) => { await api.post('/accounts', p); await refreshAll(); }, [refreshAll]);
  const updateAccount = useCallback(async (id: string, p: any) => { await api.patch(`/accounts/${id}`, p); await refreshAll(); }, [refreshAll]);
  const deleteAccount = useCallback(async (id: string) => { await api.delete(`/accounts/${id}`); await refreshAll(); }, [refreshAll]);
  const addCategory = useCallback(async (p: any) => { await api.post('/categories', p); await refreshAll(); }, [refreshAll]);
  const updateCategory = useCallback(async (id: string, p: any) => { await api.patch(`/categories/${id}`, p); await refreshAll(); }, [refreshAll]);
  const deleteCategory = useCallback(async (id: string) => { await api.delete(`/categories/${id}`); await refreshAll(); }, [refreshAll]);
  const addBudget = useCallback(async (p: any) => { await api.post('/budgets', p); await refreshAll(); }, [refreshAll]);
  const deleteBudget = useCallback(async (id: string) => { await api.delete(`/budgets/${id}`); await refreshAll(); }, [refreshAll]);
  const addTransaction = useCallback(async (p: any) => { await api.post('/transactions', p); await refreshAll(); }, [refreshAll]);
  const updateTransaction = useCallback(async (id: string, p: any) => { await api.patch(`/transactions/${id}`, p); await refreshAll(); }, [refreshAll]);
  const deleteTransaction = useCallback(async (id: string) => { await api.delete(`/transactions/${id}`); await refreshAll(); }, [refreshAll]);
  const addGoal = useCallback(async (p: any) => { await api.post('/goals', p); await refreshAll(); }, [refreshAll]);
  const updateGoal = useCallback(async (id: string, p: any) => { await api.patch(`/goals/${id}`, p); await refreshAll(); }, [refreshAll]);
  const addToGoal = useCallback(async (id: string, amount: number) => { await api.post(`/goals/${id}/add`, { amount }); await refreshAll(); }, [refreshAll]);
  const deleteGoal = useCallback(async (id: string) => { await api.delete(`/goals/${id}`); await refreshAll(); }, [refreshAll]);
  const addRecurring = useCallback(async (p: any) => { await api.post('/recurring', p); await refreshAll(); }, [refreshAll]);
  const updateRecurring = useCallback(async (id: string, p: any) => { await api.patch(`/recurring/${id}`, p); await refreshAll(); }, [refreshAll]);
  const deleteRecurring = useCallback(async (id: string) => { await api.delete(`/recurring/${id}`); await refreshAll(); }, [refreshAll]);

  return (
    <FinanceContext.Provider value={{
      accounts, categories, budgets, transactions, goals, recurring, loading,
      addAccount, updateAccount, deleteAccount,
      addCategory, updateCategory, deleteCategory,
      addBudget, deleteBudget,
      addTransaction, updateTransaction, deleteTransaction,
      addGoal, updateGoal, addToGoal, deleteGoal,
      addRecurring, updateRecurring, deleteRecurring,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider');
  return ctx;
}
