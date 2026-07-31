import React from 'react';
import { type Expense, type Category } from '../types';
import { CategoryTag } from './CategoryTag';
import { parseISO, format } from 'date-fns';
import { cn } from '../lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ 
  expenses,
  onEditExpense,
  onDeleteExpense
}) => {
  const showActions = !!(onEditExpense || onDeleteExpense);

  return (
    <div className="glass shadow-xl border-white/50 overflow-hidden bg-white/30 backdrop-blur-2xl rounded-3xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-white/50 backdrop-blur-xl text-slate-800 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/40">
              <th className="px-6 py-6 border-b border-white/30">Date</th>
              <th className="px-6 py-6 border-b border-white/30">Category</th>
              <th className="px-6 py-6 border-b border-white/30">Description</th>
              <th className="px-6 py-6 text-right border-b border-white/30">Amount (Rs)</th>
              <th className="px-6 py-6 border-b border-white/30">Payment Mode</th>
              <th className="px-6 py-6 border-b border-white/30">Notes</th>
              {showActions && <th className="px-6 py-6 border-b border-white/30 text-center w-24">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 7 : 6} className="px-6 py-32 text-center text-slate-500 font-black uppercase tracking-widest text-[10px] bg-white/5">
                  No records detected in global ledger.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-white/40 transition-all duration-200 text-sm group">
                  <td className="px-6 py-5 text-slate-600 font-bold tabular-nums">
                    {format(parseISO(expense.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-5">
                    <CategoryTag category={expense.category} />
                  </td>
                  <td className="px-6 py-5 text-slate-800 font-black tracking-tight">
                    {expense.description}
                  </td>
                  <td className="px-6 py-5 text-slate-900 font-black text-right tabular-nums text-base">
                    Rs {expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                      expense.paymentMode === 'UPI' ? 'bg-indigo-500/10 text-indigo-700 border-indigo-200' :
                      expense.paymentMode === 'Card' ? 'bg-amber-500/10 text-amber-700 border-amber-200' :
                      'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                    )}>
                      {expense.paymentMode}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium italic max-w-[200px] truncate group-hover:text-slate-700">
                    {expense.notes}
                  </td>
                  {showActions && (
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {onEditExpense && (
                          <button
                            onClick={() => onEditExpense(expense)}
                            title="Edit Settlement Entry"
                            className="p-2 text-slate-500 hover:text-accent-purple hover:bg-accent-purple/10 rounded-xl transition-all"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDeleteExpense && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to permanently delete this entry?')) {
                                onDeleteExpense(expense.id);
                              }
                            }}
                            title="Delete Settlement Entry"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
