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
import { Category, Expense, Budget, IncomeEntry, AccountId, Account, Transfer } from '../types';
import { ACCOUNT_IDS, LEGACY_PAYMENT_MODE_TO_ACCOUNT } from './accounts';

export interface RecurringExpense {
  id: string;
  category: Category;
  description: string;
  amount: number;
  accountId: AccountId;
  notes: string;
  dayOfMonth: number;
  lastProcessedMonth?: string; // YYYY-MM
}

// Legacy Firestore docs (written before accounts existed) only have `paymentMode`.
interface LegacyAccountFields {
  accountId?: AccountId;
  paymentMode?: 'Cash' | 'Card' | 'UPI';
}

function normalizeAccountId(raw: LegacyAccountFields): AccountId {
  if (raw.accountId) return raw.accountId;
  if (raw.paymentMode) return LEGACY_PAYMENT_MODE_TO_ACCOUNT[raw.paymentMode];
  return 'cash';
}

const userDoc = (uid: string) => doc(db, 'users', uid);
const expensesCol = (uid: string) => collection(db, 'users', uid, 'expenses');
const recurringCol = (uid: string) => collection(db, 'users', uid, 'recurring');
const incomeCol = (uid: string) => collection(db, 'users', uid, 'income');
const accountsCol = (uid: string) => collection(db, 'users', uid, 'accounts');
const transfersCol = (uid: string) => collection(db, 'users', uid, 'transfers');

export const storage = {
  // Real-time subscriptions - call the returned function to unsubscribe.
  subscribeExpenses(uid: string, onChange: (expenses: Expense[]) => void, onError?: (err: unknown) => void) {
    const q = query(expensesCol(uid), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snap) => onChange(snap.docs.map((d) => {
        const data = d.data() as Omit<Expense, 'id'> & LegacyAccountFields;
        return { id: d.id, ...data, accountId: normalizeAccountId(data) };
      })),
      onError,
    );
  },

  subscribeRecurringExpenses(uid: string, onChange: (items: RecurringExpense[]) => void, onError?: (err: unknown) => void) {
    return onSnapshot(
      recurringCol(uid),
      (snap) => onChange(snap.docs.map((d) => {
        const data = d.data() as Omit<RecurringExpense, 'id'> & LegacyAccountFields;
        return { id: d.id, ...data, accountId: normalizeAccountId(data) };
      })),
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
      (snap) => onChange(snap.docs.map((d) => {
        const data = d.data() as Omit<IncomeEntry, 'id'> & LegacyAccountFields;
        return { id: d.id, ...data, accountId: data.accountId ?? 'cash' };
      })),
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

  subscribeAccounts(uid: string, onChange: (accounts: Account[]) => void, onError?: (err: unknown) => void) {
    return onSnapshot(
      accountsCol(uid),
      (snap) => onChange(snap.docs.map((d) => ({ id: d.id as AccountId, ...(d.data() as Omit<Account, 'id'>) }))),
      onError,
    );
  },

  async ensureDefaultAccounts(uid: string) {
    for (const id of ACCOUNT_IDS) {
      const ref = doc(accountsCol(uid), id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { startingBalance: 0 });
      }
    }
  },

  async updateAccountStartingBalance(uid: string, id: AccountId, startingBalance: number) {
    await updateDoc(doc(accountsCol(uid), id), { startingBalance });
  },

  subscribeTransfers(uid: string, onChange: (transfers: Transfer[]) => void, onError?: (err: unknown) => void) {
    const q = query(transfersCol(uid), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transfer, 'id'>) }))),
      onError,
    );
  },

  async addTransfer(uid: string, transfer: Omit<Transfer, 'id'>): Promise<string> {
    const ref = await addDoc(transfersCol(uid), transfer);
    return ref.id;
  },

  async deleteTransfer(uid: string, id: string) {
    await deleteDoc(doc(transfersCol(uid), id));
  },
};
