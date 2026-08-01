import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { IncomeEntry, Account } from '../types';
import { ACCOUNT_META } from '../lib/accounts';
import { Avatar } from './Avatar';
import { cn } from '../lib/utils';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  incomeEntries: IncomeEntry[];
  balance: number;
  accounts: Account[];
  onAddIncome: (entry: Omit<IncomeEntry, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
  onLogout: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({
  isOpen,
  onClose,
  user,
  incomeEntries,
  balance,
  accounts,
  onAddIncome,
  onDeleteIncome,
  onLogout,
}) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [accountId, setAccountId] = useState<Account['id']>('cash');

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!label.trim() || isNaN(val)) return;
    onAddIncome({ label: label.trim(), amount: val, date, accountId });
    setLabel('');
    setAmount('');
  };

  const handleLogout = () => {
    onLogout();
    onClose();
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[70] p-6"
          >
            <div className="glass-darker p-8 shadow-2xl border-white/50 bg-white/40 backdrop-blur-2xl rounded-3xl overflow-hidden relative max-h-[85vh] flex flex-col">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-accent-purple/10 flex items-center justify-center border border-white/60 shadow-sm overflow-hidden shrink-0">
                  <Avatar
                    photoURL={user.photoURL}
                    name={user.displayName}
                    email={user.email}
                    initialClassName="text-xl"
                    className="w-full h-full flex items-center justify-center"
                  />
                </div>
                <div className="min-w-0">
                  {user.displayName && (
                    <h2 className="text-lg font-black text-slate-800 tracking-tight truncate">{user.displayName}</h2>
                  )}
                  <p className="text-xs font-bold text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="glass p-6 bg-white/60 border-white shadow-lg rounded-[2rem] text-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Current Balance</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                  Rs {balance.toLocaleString()}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Income Entries</h4>
                  <div className="space-y-2">
                    {incomeEntries.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 text-center py-6">No income logged yet.</p>
                    ) : (
                      incomeEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-white/50 border border-white/40 rounded-2xl"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{entry.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {format(parseISO(entry.date), 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-black text-slate-900 tabular-nums">
                              Rs {entry.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => {
                                if (confirm('Delete this income entry?')) onDeleteIncome(entry.id);
                              }}
                              title="Delete entry"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <form onSubmit={handleAddIncome} className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Add Income</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Label (e.g. Salary, Bonus)"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="flex-1 min-w-0 px-4 py-3 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
                    />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="px-4 py-3 bg-white/50 border border-white/40 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    {accounts.map((acc) => {
                      const meta = ACCOUNT_META[acc.id];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setAccountId(acc.id)}
                          className={cn(
                            "flex-1 py-2 px-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                            accountId === acc.id
                              ? "bg-white text-accent-purple border-white shadow-md"
                              : "bg-white/30 border-white/40 text-slate-500 hover:bg-white/50"
                          )}
                        >
                          <Icon size={12} />
                          {meta.name}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs</span>
                      <input
                        type="number"
                        required
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/40 rounded-2xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-3 bg-accent-purple text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent-purple/30 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </form>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-6 py-4 bg-white/50 hover:bg-rose-500/10 text-slate-600 hover:text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-white/40 transition-all shrink-0"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
