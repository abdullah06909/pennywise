import React from 'react';
import { Category } from '../types';
import { cn } from '../lib/utils';

interface CategoryTagProps {
  category: Category;
  showAmount?: number;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({ category, showAmount }) => {
  const styles: Record<Category, string> = {
    Food: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Transport: 'bg-blue-100 text-blue-700 border-blue-200',
    Bills: 'bg-amber-100 text-amber-700 border-amber-200',
    Shopping: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Entertainment: 'bg-rose-100 text-rose-700 border-rose-200',
    Installment: 'bg-violet-100 text-violet-700 border-violet-200',
    Committee: 'bg-teal-100 text-teal-700 border-teal-200',
    Others: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={cn(
      "px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center justify-between min-w-[100px]",
      styles[category]
    )}>
      <span>{category}</span>
      {showAmount !== undefined && (
        <span className="ml-2 opacity-80">Rs {showAmount.toLocaleString()}</span>
      )}
    </div>
  );
};
