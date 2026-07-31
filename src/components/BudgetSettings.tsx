import React, { useState } from 'react';
import { Target, X, AlertCircle } from 'lucide-react';
import { Category, Budget } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface BudgetSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  onSave: (budgets: Budget[]) => void;
}

export const BudgetSettings: React.FC<BudgetSettingsProps> = ({ isOpen, onClose, budgets, onSave }) => {
  const categories: Category[] = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Others'];
  const [localBudgets, setLocalBudgets] = useState<Budget[]>(
    categories.map(cat => budgets.find(b => b.category === cat) || { category: cat, limit: 0 })
  );

  const handleUpdateLimit = (category: Category, limit: number) => {
    setLocalBudgets(prev => prev.map(b => b.category === category ? { ...b, limit } : b));
  };

  const handleSave = () => {
    onSave(localBudgets);
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
                  <Target size={20} />
                </div>
                Vault Budgets
              </h2>
              <button onClick={onClose} className="p-3 hover:bg-white/50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="bg-white/30 backdrop-blur-md border border-white/40 p-5 rounded-2xl flex gap-3 mb-10 shadow-sm">
              <AlertCircle className="text-accent-purple shrink-0" size={18} />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                Define maximum expenditure thresholds for strategic capital preservation.
              </p>
            </div>

            <div className="space-y-6 mb-10 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {localBudgets.map((budget) => (
                <div key={budget.category} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 border-white shadow-sm",
                      budget.category === 'Food' ? 'bg-emerald-400 shadow-emerald-400/30' :
                      budget.category === 'Transport' ? 'bg-blue-400 shadow-blue-400/30' :
                      budget.category === 'Bills' ? 'bg-amber-400 shadow-amber-400/30' :
                      budget.category === 'Shopping' ? 'bg-indigo-400 shadow-indigo-400/30' :
                      budget.category === 'Entertainment' ? 'bg-rose-400 shadow-rose-400/30' : 'bg-slate-400'
                    )}></div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">{budget.category}</span>
                  </div>
                  <div className="relative group/input">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase">Rs</span>
                    <input
                      type="number"
                      value={budget.limit || ''}
                      onChange={(e) => handleUpdateLimit(budget.category, parseFloat(e.target.value) || 0)}
                      placeholder="Infinite"
                      className="pl-12 pr-4 py-3 bg-white/50 border border-white/40 rounded-2xl focus:ring-4 focus:ring-accent-purple/10 outline-none text-sm font-black text-slate-800 w-36 transition-all shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-accent-purple text-white font-black uppercase tracking-[0.2em] py-5 rounded-3xl shadow-2xl shadow-accent-purple/40 hover:scale-[1.02] active:scale-95 transition-all text-xs"
            >
              Authorize Flux
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
