import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, FileText, Repeat } from 'lucide-react';
import { Category, Expense, Account } from '../types';
import { ACCOUNT_META } from '../lib/accounts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface AddExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>, isRecurring: boolean) => void;
  onUpdate?: (id: string, updatedExpense: Omit<Expense, 'id'>) => void;
  editExpense?: Expense | null;
  accounts: Account[];
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  editExpense,
  accounts
}) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Food' as Category,
    description: '',
    amount: '',
    accountId: 'cash' as Account['id'],
    notes: '',
  });

  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (editExpense) {
      setFormData({
        date: editExpense.date,
        category: editExpense.category,
        description: editExpense.description,
        amount: editExpense.amount.toString(),
        accountId: editExpense.accountId,
        notes: editExpense.notes || '',
      });
      setIsRecurring(!!editExpense.isRecurring);
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Food' as Category,
        description: '',
        amount: '',
        accountId: 'cash' as Account['id'],
        notes: '',
      });
      setIsRecurring(false);
    }
  }, [editExpense, isOpen]);

  const categories: Category[] = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Installment', 'Committee', 'Others'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    if (editExpense && onUpdate) {
      onUpdate(editExpense.id, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
    } else {
      onAdd({
        ...formData,
        amount: parseFloat(formData.amount),
      }, isRecurring);
    }

    onClose();
    // Reset if it was a new entry
    if (!editExpense) {
      setIsRecurring(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Food',
        description: '',
        amount: '',
        accountId: 'cash',
        notes: '',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass-darker bg-white/40 backdrop-blur-2xl shadow-2xl z-50 p-8 overflow-y-auto border-l border-white/40"
          >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                  {editExpense ? "Edit Entry" : "New Entry"}
                </h2>
                <button onClick={onClose} className="p-3 hover:bg-white/50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Recurring Toggle */}
                <div className="flex items-center justify-between p-5 glass bg-accent-purple/10 border-accent-purple/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-purple rounded-xl text-white">
                      <Repeat size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Recurring</p>
                      <p className="text-[9px] text-slate-500 font-bold">Process monthly</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={cn(
                      "w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out",
                      isRecurring ? "bg-accent-purple" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm",
                      isRecurring ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Fiscal Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/40 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Vault Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={cn(
                          "py-3 px-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all text-center",
                          formData.category === cat
                            ? "bg-white text-accent-purple border-white shadow-xl"
                            : "bg-white/20 border-white/40 text-slate-500 hover:bg-white/40"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="Ledger entry description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/40 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Capital Amount (Rs)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rs</span>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-12 pr-4 py-6 bg-white shadow-inner text-slate-800 text-3xl font-black rounded-3xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none placeholder:text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Source Account</label>
                  <div className="flex gap-3">
                    {accounts.map((acc) => {
                      const meta = ACCOUNT_META[acc.id];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, accountId: acc.id })}
                          className={cn(
                            "flex-1 py-4 px-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2",
                            formData.accountId === acc.id
                              ? "bg-white text-accent-purple border-white shadow-xl"
                              : "bg-white/20 border-white/40 text-slate-500 hover:bg-white/40"
                          )}
                        >
                          <Icon size={14} />
                          {meta.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Intelligence Notes</label>
                  <textarea
                    placeholder="Supplementary details..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-4 bg-white/40 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none resize-none font-medium text-slate-700 placeholder:text-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-purple text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-2xl shadow-accent-purple/40 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                >
                  {editExpense ? "Update Entry" : "Confirm Entry"}
                </button>
              </form>
            </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
