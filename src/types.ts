
export type Category = 'Food' | 'Transport' | 'Bills' | 'Shopping' | 'Entertainment' | 'Others';

export type PaymentMode = 'Cash' | 'Card' | 'UPI';

export interface Expense {
  id: string;
  date: string;
  category: Category;
  description: string;
  amount: number;
  paymentMode: PaymentMode;
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
}
