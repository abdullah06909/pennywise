import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Category, Expense } from '../types';

interface DashboardChartsProps {
  expenses: Expense[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ expenses }) => {
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<Category, number>);

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS: Record<string, string> = {
    Food: '#10b981',
    Transport: '#0ea5e9',
    Bills: '#f59e0b',
    Shopping: '#6366f1',
    Entertainment: '#f43f5e',
    Installment: '#8b5cf6',
    Committee: '#14b8a6',
    Others: '#64748b',
  };

  return (
    <div className="glass p-6 shadow-sm h-full border-white/20">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-purple shadow-sm shadow-accent-purple/50"></span>
        Dashboard Overview
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              stroke="none"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '8px 12px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value: number) => `Rs ${value.toLocaleString()}`}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              iconType="circle"
              formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
