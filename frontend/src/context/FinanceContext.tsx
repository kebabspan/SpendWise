import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { Account, Budget, Category, Transaction } from '../types';

interface FinanceContextValue {
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  transactions: Transaction[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  addAccount: (payload: Partial<Account> & { name: string; balance?: number }) => Promise<void>;
  addCategory: (payload: Partial<Category> & { name: string; type: 'INCOME' | 'EXPENSE' }) => Promise<void>;
  addBudget: (payload: { limitAmount: number; month: number; year: number; categoryId: string }) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addTransaction: (payload: {
    amount: number;
    description?: string;
    place?: string;
    date?: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    categoryId?: string;
    accountId: string;
    toAccountId?: string;
  }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [accountsRes, categoriesRes, budgetsRes, transactionsRes] = await Promise.all([
        api.get<Account[]>('/accounts'),
        api.get<Category[]>('/categories'),
        api.get<Budget[]>('/budgets'),
        api.get<Transaction[]>('/transactions'),
      ]);

      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
      setBudgets(budgetsRes.data);
      setTransactions(transactionsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAll();
  }, []);

  const addAccount = async (payload: Partial<Account> & { name: string; balance?: number }) => {
    await api.post('/accounts', payload);
    await refreshAll();
  };

  const addCategory = async (payload: Partial<Category> & { name: string; type: 'INCOME' | 'EXPENSE' }) => {
    await api.post('/categories', payload);
    await refreshAll();
  };

  const addBudget = async (payload: { limitAmount: number; month: number; year: number; categoryId: string }) => {
    await api.post('/budgets', payload);
    await refreshAll();
  };

  const deleteBudget = async (id: string) => {
    await api.delete(`/budgets/${id}`);
    await refreshAll();
  };

  const addTransaction = async (payload: {
    amount: number;
    description?: string;
    place?: string;
    date?: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    categoryId?: string;
    accountId: string;
    toAccountId?: string;
  }) => {
    await api.post('/transactions', payload);
    await refreshAll();
  };

  const deleteTransaction = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    await refreshAll();
  };

  const value = useMemo(
    () => ({
      accounts,
      categories,
      budgets,
      transactions,
      loading,
      refreshAll,
      addAccount,
      addCategory,
      addBudget,
      deleteBudget,
      addTransaction,
      deleteTransaction,
    }),
    [accounts, categories, budgets, transactions, loading],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}
