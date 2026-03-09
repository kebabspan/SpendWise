import type { Account, Budget, Transaction } from '../types';

export type RangeKey = '7d' | '30d' | '3m' | '6m' | 'all';

export function toAmount(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function formatCurrency(value: number | string, currency = 'HUF') {
  const amount = toAmount(value);
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function clampPositiveNumber(value: string | number, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function getRangeStart(range: RangeKey) {
  const now = new Date();
  const date = new Date(now);

  switch (range) {
    case '7d':
      date.setDate(now.getDate() - 6);
      return date;
    case '30d':
      date.setDate(now.getDate() - 29);
      return date;
    case '3m':
      date.setMonth(now.getMonth() - 2);
      return date;
    case '6m':
      date.setMonth(now.getMonth() - 5);
      return date;
    case 'all':
    default:
      return new Date(0);
  }
}

export function filterTransactionsByRange(transactions: Transaction[], range: RangeKey) {
  const start = getRangeStart(range).getTime();
  return transactions.filter((item) => new Date(item.date).getTime() >= start);
}

export function filterTransactionsByAccount(
  transactions: Transaction[],
  accountId: string,
) {
  if (accountId === 'all') return transactions;
  return transactions.filter(
    (item) => item.fromAccountId === accountId || item.toAccountId === accountId,
  );
}

export function getMonthlyIncome(transactions: Transaction[]) {
  return transactions
    .filter((item) => item.type === 'INCOME')
    .reduce((sum, item) => sum + toAmount(item.amount), 0);
}

export function getMonthlyExpenses(transactions: Transaction[]) {
  return transactions
    .filter((item) => item.type === 'EXPENSE')
    .reduce((sum, item) => sum + toAmount(item.amount), 0);
}

export function getNetFlow(transactions: Transaction[]) {
  return getMonthlyIncome(transactions) - getMonthlyExpenses(transactions);
}

export function getTotalBalance(accounts: Account[]) {
  return accounts.reduce((sum, account) => sum + toAmount(account.balance), 0);
}

export function getTopCategories(transactions: Transaction[]) {
  const map = new Map<string, number>();

  for (const item of transactions) {
    if (item.type !== 'EXPENSE') continue;
    const key = item.category?.name || 'Uncategorized';
    map.set(key, (map.get(key) || 0) + toAmount(item.amount));
  }

  return [...map.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

export function getLargestExpense(transactions: Transaction[]) {
  return transactions
    .filter((item) => item.type === 'EXPENSE')
    .sort((a, b) => toAmount(b.amount) - toAmount(a.amount))[0] || null;
}

export function getBudgetInsights(budgets: Budget[], transactions: Transaction[]) {
  return budgets.map((budget) => {
    const spent = transactions
      .filter(
        (item) =>
          item.type === 'EXPENSE' &&
          item.categoryId === budget.categoryId &&
          new Date(item.date).getMonth() + 1 === budget.month &&
          new Date(item.date).getFullYear() === budget.year,
      )
      .reduce((sum, item) => sum + toAmount(item.amount), 0);

    const limit = toAmount(budget.limitAmount);
    const ratio = limit > 0 ? spent / limit : 0;

    return {
      id: budget.id,
      categoryName: budget.category?.name || 'Unknown',
      spent,
      limit,
      ratio,
      exceeded: spent > limit,
      remaining: Math.max(limit - spent, 0),
    };
  });
}

export function buildReportMessages(transactions: Transaction[], budgets: Budget[]) {
  const messages: { tone: 'good' | 'warn' | 'bad'; title: string; body: string }[] = [];

  const expenseTransactions = transactions.filter((item) => item.type === 'EXPENSE');
  const totalExpenses = getMonthlyExpenses(transactions);
  const largestExpense = getLargestExpense(transactions);
  const topCategories = getTopCategories(transactions);
  const budgetInsights = getBudgetInsights(budgets, transactions);

  if (largestExpense) {
    messages.push({
      tone: 'warn',
      title: 'Largest expense detected',
      body: `Your highest single expense was ${formatCurrency(largestExpense.amount)} on ${new Date(
        largestExpense.date,
      ).toLocaleDateString('hu-HU')}.`,
    });
  }

  if (topCategories[0]) {
    const share = totalExpenses > 0 ? Math.round((topCategories[0].total / totalExpenses) * 100) : 0;
    messages.push({
      tone: share >= 40 ? 'warn' : 'good',
      title: 'Top spending category',
      body: `${topCategories[0].name} represents ${share}% of your expense volume in the selected period.`,
    });
  }

  const exceededBudgets = budgetInsights.filter((item) => item.exceeded);
  if (exceededBudgets.length > 0) {
    messages.push({
      tone: 'bad',
      title: 'Budget overspend alert',
      body: `You exceeded ${exceededBudgets.length} budget${exceededBudgets.length > 1 ? 's' : ''} this month.`,
    });
  } else if (budgets.length > 0) {
    messages.push({
      tone: 'good',
      title: 'Budgets under control',
      body: 'No budget has been exceeded in the selected month.',
    });
  }

  if (expenseTransactions.length > 0) {
    const byDay = new Map<string, number>();
    for (const item of expenseTransactions) {
      const key = new Date(item.date).toLocaleDateString('hu-HU');
      byDay.set(key, (byDay.get(key) || 0) + toAmount(item.amount));
    }

    const highestDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
    if (highestDay) {
      messages.push({
        tone: 'warn',
        title: 'Highest spending day',
        body: `You spent the most on ${highestDay[0]} with a total of ${formatCurrency(highestDay[1])}.`,
      });
    }
  }

  if (totalExpenses > 0) {
    const avgDaily = Math.round(totalExpenses / Math.max(1, new Set(
      expenseTransactions.map((item) => new Date(item.date).toDateString()),
    ).size));

    messages.push({
      tone: avgDaily > 50000 ? 'warn' : 'good',
      title: 'Average spending pace',
      body: `Your average spending per active day is ${formatCurrency(avgDaily)}.`,
    });
  }

  return messages.slice(0, 6);
}