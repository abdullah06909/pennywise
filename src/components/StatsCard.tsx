import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'accent' | 'neutral';
  className?: string;
  onEdit?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant,
  className,
  onEdit
}) => {
  const themes = {
    primary: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    secondary: 'bg-rose-50 border-rose-100 text-rose-700',
    accent: 'bg-blue-50 border-blue-100 text-blue-700',
    neutral: 'bg-amber-50 border-amber-100 text-amber-700',
  };

  const iconBg = {
    primary: 'bg-emerald-100',
    secondary: 'bg-rose-100',
    accent: 'bg-blue-100',
    neutral: 'bg-amber-100',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onEdit}
      className={cn(
        "p-6 rounded-2xl glass flex items-center justify-between shadow-sm border-white/20 transition-all",
        onEdit ? "cursor-pointer hover:bg-white/90 hover:border-accent-purple/40 hover:shadow-lg hover:shadow-accent-purple/5 group" : "",
        className
      )}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          {onEdit && (
            <span className="opacity-0 group-hover:opacity-100 text-[8px] font-black uppercase tracking-wider text-accent-purple bg-accent-purple/10 px-1.5 py-0.5 rounded-md transition-all flex items-center gap-1">
              <Pencil size={8} /> Change
            </span>
          )}
        </div>
        {subtitle && <p className="text-[10px] opacity-60 mb-2">{subtitle}</p>}
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black text-slate-800 leading-none">
            {typeof value === 'number' ? `Rs ${value.toLocaleString()}` : value}
          </h2>
        </div>
      </div>
      <div className={cn(
        "p-4 rounded-xl shrink-0 ml-4",
        variant === 'primary' ? 'bg-emerald-500/10 text-emerald-600' :
        variant === 'secondary' ? 'bg-rose-500/10 text-rose-600' :
        variant === 'accent' ? 'bg-blue-500/10 text-blue-600' :
        'bg-amber-500/10 text-amber-600'
      )}>
        <Icon size={24} />
      </div>
    </motion.div>
  );
};
