import React from 'react';
import { Calendar, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  onClear: () => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, onDateChange, onClear }) => {
  return (
    <div className="glass p-4 px-6 flex flex-wrap items-center gap-4 bg-white/20 border-white/30 backdrop-blur-xl rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <Calendar size={14} className="text-accent-purple" />
        <span className="text-[10px] font-black uppercase tracking-widest">Time range Filter</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative group">
          <label className="absolute -top-2 left-3 bg-white/80 px-1 text-[8px] font-black uppercase text-slate-400 rounded ring-1 ring-white/50 backdrop-blur-sm">Start</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="bg-white/40 border border-white/40 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
          />
        </div>
        
        <span className="text-slate-300 font-black">→</span>

        <div className="relative group">
          <label className="absolute -top-2 left-3 bg-white/80 px-1 text-[8px] font-black uppercase text-slate-400 rounded ring-1 ring-white/50 backdrop-blur-sm">End</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            className="bg-white/40 border border-white/40 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
          />
        </div>
      </div>

      {(startDate || endDate) && (
        <button 
          onClick={onClear}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-200/50 hover:bg-rose-500/20 transition-all"
        >
          <X size={12} /> Reset Range
        </button>
      )}
    </div>
  );
};
