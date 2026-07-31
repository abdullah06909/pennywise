import React from 'react';
import { Settings, PlusCircle, PieChart, List, Wallet, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  onAddExpense: () => void;
  onSetSalary: () => void;
  onSetBudget: () => void;
  categories: Category[];
  currentCategory?: Category;
  onSelectCategory: (cat?: Category) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onAddExpense, 
  onSetSalary, 
  onSetBudget,
  categories,
  currentCategory,
  onSelectCategory
}) => {
  const actions = [
    { label: 'Set Salary', icon: Settings, onClick: onSetSalary },
    { label: 'Set Budgets', icon: Target, onClick: onSetBudget },
    { label: 'Add Expense', icon: PlusCircle, onClick: onAddExpense },
    { label: 'View Summary', icon: PieChart, onClick: () => {} },
    { label: 'Category List', icon: List, onClick: () => onSelectCategory(undefined) },
  ];

  const categoryColors: Record<Category, string> = {
    Food: 'bg-emerald-500',
    Transport: 'bg-blue-500',
    Bills: 'bg-amber-500',
    Shopping: 'bg-indigo-500',
    Entertainment: 'bg-rose-500',
    Others: 'bg-slate-500',
  };

  return (
    <aside className="space-y-8 h-full bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl">
      <div className="mb-10 flex items-center gap-3">
        <img src="/files/pennywise-owl-mark.svg" alt="" className="w-9 h-9 shrink-0" />
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-accent-purple)', letterSpacing: '-0.02em' }}>PennyWise</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Smart Spending</div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/70 mb-4 px-2">Navigation</h3>
        <div className="space-y-1.5">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white/40 rounded-2xl transition-all group"
            >
              <div className="p-2 rounded-xl bg-white/50 group-hover:bg-accent-purple group-hover:text-white transition-colors">
                <action.icon size={16} />
              </div>
              {action.label}
            </button>
          ))}
        </div>
      </section>

      {/* Categories List */}
      <section>
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/70">Vaults</h3>
        </div>
        <div className="space-y-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all",
                currentCategory === cat 
                  ? "bg-white/50 text-accent-purple shadow-sm border border-white/40" 
                  : "text-slate-700 hover:bg-white/20"
              )}
            >
              <span className={cn(
                "w-2.5 h-2.5 rounded-full border border-white/20",
                currentCategory === cat ? "bg-accent-purple shadow-sm shadow-accent-purple/50" : categoryColors[cat]
              )}></span>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Sync Status Note */}
      <section className="mt-auto pt-8 border-t border-white/10">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Sync Active</span>
        </div>
      </section>
    </aside>
  );
};
