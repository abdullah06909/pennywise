import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightLeft, ArrowRight, X, Trash2, Pencil } from 'lucide-react';
import { Account, AccountId, Transfer } from '../types';
import { ACCOUNT_IDS, ACCOUNT_META, accountName } from '../lib/accounts';
import { StatsCard } from './StatsCard';
import { TransferForm } from './TransferForm';
import { format, parseISO } from 'date-fns';

interface AccountsTabProps {
  accounts: Account[];
  accountBalances: Record<AccountId, number>;
  transfers: Transfer[];
  onUpdateStartingBalance: (id: AccountId, startingBalance: number) => void;
  onAddTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  onDeleteTransfer: (id: string) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts,
  accountBalances,
  transfers,
  onUpdateStartingBalance,
  onAddTransfer,
  onDeleteTransfer,
}) => {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editValue, setEditValue] = useState('');

  const accountsById = new Map(accounts.map((acc) => [acc.id, acc]));

  const openEdit = (id: AccountId) => {
    const acc = accountsById.get(id) ?? { id, startingBalance: 0 };
    setEditingAccount(acc);
    setEditValue(acc.startingBalance.toString());
  };

  const handleSaveEdit = () => {
    if (!editingAccount) return;
    const val = parseFloat(editValue);
    if (isNaN(val)) return;
    onUpdateStartingBalance(editingAccount.id, val);
    setEditingAccount(null);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Capital Accounts</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Bank, EasyPaisa & Cash reserves</p>
        </div>
        <button
          onClick={() => setIsTransferOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-accent-purple hover:bg-accent-purple/90 rounded-xl transition-all shadow-lg shadow-accent-purple/30"
        >
          <ArrowRightLeft size={14} /> Transfer Funds
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACCOUNT_IDS.map((id) => {
          const meta = ACCOUNT_META[id];
          const acc = accountsById.get(id);
          return (
            <StatsCard
              key={id}
              title={meta.name}
              subtitle={`Starting: Rs ${(acc?.startingBalance ?? 0).toLocaleString()}`}
              value={accountBalances[id] ?? 0}
              variant={meta.variant}
              icon={meta.icon}
              onEdit={() => openEdit(id)}
            />
          );
        })}
      </div>

      <div className="px-4 space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Transfer History</h3>
        <div className="space-y-2">
          {transfers.length === 0 ? (
            <p className="text-xs font-bold text-slate-400 text-center py-10 glass bg-white/30 rounded-2xl">No transfers logged yet.</p>
          ) : (
            transfers.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 px-5 py-4 bg-white/50 border border-white/40 rounded-2xl glass"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-black text-slate-800">{accountName(t.fromAccountId)}</span>
                  <ArrowRight size={14} className="text-slate-400 shrink-0" />
                  <span className="text-sm font-black text-slate-800">{accountName(t.toAccountId)}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    {format(parseISO(t.date), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-black text-slate-900 tabular-nums">
                    Rs {t.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Delete this transfer?')) onDeleteTransfer(t.id);
                    }}
                    title="Delete transfer"
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

      <TransferForm
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        accounts={ACCOUNT_IDS.map((id) => accountsById.get(id) ?? { id, startingBalance: 0 })}
        onSubmit={onAddTransfer}
      />

      <AnimatePresence>
        {editingAccount && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingAccount(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-0 m-auto h-fit w-full max-w-sm glass-darker bg-white/40 backdrop-blur-2xl shadow-2xl z-50 p-8 rounded-[2.5rem] overflow-hidden border border-white/50"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-3">
                  <div className="p-2 bg-accent-purple rounded-xl text-white shadow-lg shadow-accent-purple/30">
                    <Pencil size={16} />
                  </div>
                  {ACCOUNT_META[editingAccount.id].name} Balance
                </h2>
                <button onClick={() => setEditingAccount(null)} className="p-3 hover:bg-white/50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 mb-8">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Starting Balance (Rs)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rs</span>
                  <input
                    type="number"
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 bg-white shadow-inner text-slate-800 text-2xl font-black rounded-3xl focus:ring-4 focus:ring-accent-purple/10 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full bg-accent-purple text-white font-black uppercase tracking-[0.2em] py-4 rounded-3xl shadow-2xl shadow-accent-purple/40 hover:scale-[1.02] active:scale-95 transition-all text-xs"
              >
                Save Balance
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
