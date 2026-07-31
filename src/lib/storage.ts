import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, Expense, Budget, IncomeEntry, PaymentMode } from '../types';

export interface RecurringExpense {
  id: string;
  category: Category;
  description: string;
  amount: number;
  paymentMode: PaymentMode;
  notes: string;
  dayOfMonth: number;
  lastProcessedMonth?: string; // YYYY-MM
}

const userDoc = (uid: string) => doc(db, 'users', uid);
const expensesCol = (uid: string) => collection(db, 'users', uid, 'expenses');
const recurringCol = (uid: string) => collection(db, 'users', uid, 'recurring');
const incomeCol = (uid: string) => collection(db, 'users', uid, 'income');

export const storage = {
  // Real-time subscriptions - call the returned function to unsubscribe.
  subscribeExpenses(uid: string, onChange: (expenses: Expense[]) => void, onError?: (err: unknown) => void) {
    const q = query(expensesCol(uid), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Expense, 'id'>) }))),
      onError,
    );
  },

  subscribeRecurringExpenses(uid: string, onChange: (items: RecurringExpense[]) => void, onError?: (err: unknown) => void) {
    return onSnapshot(
      recurringCol(uid),
      (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RecurringExpense, 'id'>) }))),
      onError,
    );
  },

  async addExpense(uid: string, expense: Omit<Expense, 'id'>): Promise<string> {
    const ref = await addDoc(expensesCol(uid), expense);
    return ref.id;
  },

  async updateExpense(uid: string, id: string, data: Omit<Expense, 'id'>) {
    await updateDoc(doc(expensesCol(uid), id), { ...data });
  },

  async deleteExpense(uid: string, id: string) {
    await deleteDoc(doc(expensesCol(uid), id));
  },

  async addRecurringExpense(uid: string, recurring: Omit<RecurringExpense, 'id'>) {
    await addDoc(recurringCol(uid), recurring);
  },

  async markRecurringProcessed(uid: string, id: string, monthStr: string) {
    await updateDoc(doc(recurringCol(uid), id), { lastProcessedMonth: monthStr });
  },

  subscribeIncome(uid: string, onChange: (income: IncomeEntry[]) => void, onError?: (err: unknown) => void) {
    const q = query(incomeCol(uid), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<IncomeEntry, 'id'>) }))),
      onError,
    );
  },

  async addIncome(uid: string, entry: Omit<IncomeEntry, 'id'>): Promise<string> {
    const ref = await addDoc(incomeCol(uid), entry);
    return ref.id;
  },

  async deleteIncome(uid: string, id: string) {
    await deleteDoc(doc(incomeCol(uid), id));
  },

  async getBudgets(uid: string): Promise<Budget[]> {
    const snap = await getDoc(userDoc(uid));
    const budgets = snap.data()?.budgets;
    return Array.isArray(budgets) ? (budgets as Budget[]) : [];
  },

  async saveBudgets(uid: string, budgets: Budget[]) {
    await setDoc(userDoc(uid), { budgets }, { merge: true });
  },
};
