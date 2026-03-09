export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface User {
  id: string;
  email: string;
  name: string;
  currency?: string;
  imageUrl?: string | null;
  createdAt?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number | string;
  color?: string | null;
  icon?: string | null;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
}

export interface Budget {
  id: string;
  limitAmount: number | string;
  month: number;
  year: number;
  categoryId: string;
  category: Category;
}

export interface Transaction {
  id: string;
  amount: number | string;
  note?: string | null;
  place?: string | null;
  date: string;
  type: TransactionType;
  categoryId?: string | null;
  category?: Category | null;
  fromAccountId?: string | null;
  fromAccount?: Account | null;
  toAccountId?: string | null;
  toAccount?: Account | null;
  createdAt?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
