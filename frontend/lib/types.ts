export type User = {
  id: string;
  email: string;
  name?: string | null;
  currency?: string;
};

export type Account = {
  id: string;
  name: string;
  balance: string | number;
  color?: string | null;
  icon?: string | null;
};

export type Category = {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  color?: string | null;
  icon?: string | null;
};

export type Transaction = {
  id: string;
  amount: string | number;
  note?: string | null;
  place?: string | null;
  date: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  category?: Category | null;
  fromAccount?: Account | null;
  toAccount?: Account | null;
};

export type Budget = {
  id: string;
  limitAmount: string | number;
  month: number;
  year: number;
  category: Category;
};
