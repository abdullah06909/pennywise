
export type Category = 'Food' | 'Transport' | 'Bills' | 'Shopping' | 'Entertainment' | 'Others';

export type AccountId = 'bank' | 'easypaisa' | 'cash';

export interface Account {
  id: AccountId;
  startingBalance: number;
}

export interface Transfer {
  id: string;
  date: string;
  fromAccountId: AccountId;
  toAccountId: AccountId;
  amount: number;
  note?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: Category;
  description: string;
  amount: number;
  accountId: AccountId;
  notes: string;
  isRecurring?: boolean;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface IncomeEntry {
  id: string;
  date: string;
  label: string;
  amount: number;
  accountId: AccountId;
}
