import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, X } from 'lucide-react';
import { Account, AccountId, Transfer } from '../types';
import { ACCOUNT_META } from '../lib/accounts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSubmit: (transfer: Omit<Transfer, 'id'>) => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({ isOpen, onClose, accounts, onSubmit }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fromAccountId, setFromAccountId] = useState<AccountId>('bank');
  const [toAccountId, setToAccountId] = useState<AccountId>('cash');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setFromAccountId('bank');
      setToAccountId('cash');
      setAmount('');
      setNote('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0 || fromAccountId === toAccountId) return;
    onSubmit({ date, fromAccountId, toAccountId, amount: val, note: note.trim() || undefined });
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 m-auto h-fit w-full max-w-lg glass-darker bg-white/40 backdrop-blur-2xl shadow-2xl z-50 p-10 rounded-[2.5rem] overflow-hidden border border-white/50"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-3">
                <div className="p-2 bg-accent-purple rounded-xl text-white shadow-lg shadow-accent-purple/30">
                  <ArrowRightLeft size={20} />
                </div>
                Transfer Funds
              </h2>
              <button onClick={onClose} className="p-3 hover:bg-white/50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-4 bg-white/40 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none font-bold text-slate-700"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">From</label>
                <div className="flex gap-3">
                  {accounts.map((acc) => {
                    const meta = ACCOUNT_META[acc.id];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setFromAccountId(acc.id);
                          if (acc.id === toAccountId) {
                            const fallback = accounts.find((a) => a.id !== acc.id);
                            if (fallback) setToAccountId(fallback.id);
                          }
                        }}
                        className={cn(
                          "flex-1 py-4 px-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2",
                          fromAccountId === acc.id
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

              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">To</label>
                <div className="flex gap-3">
                  {accounts.filter((acc) => acc.id !== fromAccountId).map((acc) => {
                    const meta = ACCOUNT_META[acc.id];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setToAccountId(acc.id)}
                        className={cn(
                          "flex-1 py-4 px-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2",
                          toAccountId === acc.id
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
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Amount (Rs)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rs</span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-6 bg-white shadow-inner text-slate-800 text-3xl font-black rounded-3xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none placeholder:text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ATM withdrawal"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-4 bg-white/40 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-accent-purple text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-2xl shadow-accent-purple/40 hover:scale-[1.02] active:scale-95 transition-all text-xs"
              >
                Confirm Transfer
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
