import { useState, useEffect, useMemo, useRef } from 'react';
import type { User } from 'firebase/auth';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Target,
  Download,
  RefreshCcw,
  LayoutDashboard,
  BarChart3,
  ListFilter,
  Landmark,
  Plus,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatsCard } from './components/StatsCard';
import { Avatar } from './components/Avatar';
import { ExpenseTable } from './components/ExpenseTable';
import { AddExpenseForm } from './components/AddExpenseForm';
import { DashboardCharts } from './components/DashboardCharts';
import { BudgetSettings } from './components/BudgetSettings';
import { ProfilePanel } from './components/ProfilePanel';
import { DateFilter } from './components/DateFilter';
import { AccountsTab } from './components/AccountsTab';
import { storage } from './lib/storage';
import { useAuth } from './lib/AuthContext';
import { accountName } from './lib/accounts';
import { Expense, Category, IncomeEntry, Budget, Account, Transfer, AccountId } from './types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { cn } from './lib/utils';

export function Dashboard({ user }: { user: User }) {
  const { signOutUser } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [activeTab, setActiveTab] = useState<'tracker' | 'summary' | 'categories' | 'accounts'>('tracker');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Live expenses feed
  useEffect(() => {
    const unsubscribe = storage.subscribeExpenses(user.uid, setExpenses);
    return unsubscribe;
  }, [user.uid]);

  // Live income feed
  useEffect(() => {
    const unsubscribe = storage.subscribeIncome(user.uid, setIncome);
    return unsubscribe;
  }, [user.uid]);

  // Accounts: seed the 3 fixed accounts once (no-op if they already exist), then subscribe
  useEffect(() => {
    storage.ensureDefaultAccounts(user.uid);
    const unsubscribe = storage.subscribeAccounts(user.uid, setAccounts);
    return unsubscribe;
  }, [user.uid]);

  // Live transfers feed
  useEffect(() => {
    const unsubscribe = storage.subscribeTransfers(user.uid, setTransfers);
    return unsubscribe;
  }, [user.uid]);

  // Budgets are loaded once per session (infrequent writes)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loadedBudgets = await storage.getBudgets(user.uid);
      if (!cancelled) {
        setBudgets(loadedBudgets);
      }
    })();
    return () => { cancelled = true; };
  }, [user.uid]);

  // Recurring expenses: create this month's occurrence the first time it's seen
  const processedThisSession = useRef<Set<string>>(new Set());
  useEffect(() => {
    const unsubscribe = storage.subscribeRecurringExpenses(user.uid, (recurring) => {
      const now = new Date();
      const currentMonthStr = format(now, 'yyyy-MM');

      recurring.forEach((rec) => {
        if (rec.lastProcessedMonth !== currentMonthStr && !processedThisSession.current.has(rec.id)) {
          processedThisSession.current.add(rec.id);
          const expenseDate = new Date(now.getFullYear(), now.getMonth(), rec.dayOfMonth);
          storage.addExpense(user.uid, {
            date: format(expenseDate, 'yyyy-MM-dd'),
            category: rec.category,
            description: rec.description + ' (Recurring)',
            amount: rec.amount,
            accountId: rec.accountId,
            notes: rec.notes,
            isRecurring: true
          }).then(() => storage.markRecurringProcessed(user.uid, rec.id, currentMonthStr));
        }
      });
    });
    return unsubscribe;
  }, [user.uid]);

  // Totals calculations
  const totals = useMemo(() => {
    const currentMonth = new Date();
    const start = dateRange.start ? parseISO(dateRange.start) : startOfMonth(currentMonth);
    const end = dateRange.end ? parseISO(dateRange.end) : endOfMonth(currentMonth);

    const filteredList = expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      return isWithinInterval(expDate, { start, end });
    });

    const filteredIncome = income.filter(inc => {
      const incDate = parseISO(inc.date);
      return isWithinInterval(incDate, { start, end });
    });

    const total = filteredList.reduce((sum, exp) => sum + exp.amount, 0);
    const incomeTotal = filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);
    return {
      total,
      incomeTotal,
      remaining: incomeTotal - total,
      count: filteredList.length,
      filteredList
    };
  }, [expenses, income, dateRange]);

  // Per-account balance: starting balance + income to that account - expenses from that account,
  // adjusted for transfers in/out. Independent of dateRange (always all-time).
  const accountBalances = useMemo(() => {
    const balances: Record<AccountId, number> = { bank: 0, easypaisa: 0, cash: 0 };
    accounts.forEach((acc) => { balances[acc.id] = acc.startingBalance; });
    income.forEach((inc) => { balances[inc.accountId] += inc.amount; });
    expenses.forEach((exp) => { balances[exp.accountId] -= exp.amount; });
    transfers.forEach((t) => {
      balances[t.fromAccountId] -= t.amount;
      balances[t.toAccountId] += t.amount;
    });
    return balances;
  }, [accounts, income, expenses, transfers]);

  // True running balance: sum of all account balances (starting balances + all-time income/expenses/transfers)
  const allTimeBalance = useMemo(() => {
    return Object.values(accountBalances).reduce((sum, b) => sum + b, 0);
  }, [accountBalances]);

  const categorySummary = useMemo(() => {
    const summary: Record<Category, number> = {
      Food: 0, Transport: 0, Bills: 0, Shopping: 0, Entertainment: 0, Others: 0
    };
    totals.filteredList.forEach(exp => {
      summary[exp.category] += exp.amount;
    });
    return summary;
  }, [totals.filteredList]);

  // Budget Warnings
  const budgetWarnings = useMemo(() => {
    return budgets.filter(b => {
      const spent = categorySummary[b.category] || 0;
      return b.limit > 0 && spent >= b.limit * 0.8; // Warning at 80%
    });
  }, [budgets, categorySummary]);

  const addExpense = async (data: Omit<Expense, 'id'>, isRecurring: boolean) => {
    await storage.addExpense(user.uid, data);

    if (isRecurring) {
      await storage.addRecurringExpense(user.uid, {
        category: data.category,
        description: data.description,
        amount: data.amount,
        accountId: data.accountId,
        notes: data.notes,
        dayOfMonth: parseISO(data.date).getDate(),
        lastProcessedMonth: format(parseISO(data.date), 'yyyy-MM')
      });
    }
  };

  const updateExpense = async (id: string, updatedData: Omit<Expense, 'id'>) => {
    await storage.updateExpense(user.uid, id, updatedData);
    setEditingExpense(null);
  };

  const deleteExpense = async (id: string) => {
    await storage.deleteExpense(user.uid, id);
  };

  const addIncome = async (data: Omit<IncomeEntry, 'id'>) => {
    await storage.addIncome(user.uid, data);
  };

  const deleteIncome = async (id: string) => {
    await storage.deleteIncome(user.uid, id);
  };

  const addTransfer = async (data: Omit<Transfer, 'id'>) => {
    await storage.addTransfer(user.uid, data);
  };

  const deleteTransfer = async (id: string) => {
    await storage.deleteTransfer(user.uid, id);
  };

  const updateAccountStartingBalance = async (id: AccountId, startingBalance: number) => {
    await storage.updateAccountStartingBalance(user.uid, id, startingBalance);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Account', 'Notes'];
    const rows = expenses.map(e => [
      e.date,
      e.category,
      e.description,
      e.amount,
      accountName(e.accountId),
      e.notes
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PennyWise_Export_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredExpenses = useMemo(() => {
    let list = totals.filteredList;
    if (selectedCategory) {
      list = list.filter(e => e.category === selectedCategory);
    }
    return list;
  }, [totals.filteredList, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="px-8 py-6 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto glass p-4 px-6 flex justify-between items-center bg-white/20 shadow-xl border-white/30 backdrop-blur-2xl rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-purple rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent-purple/40">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                {dateRange.start && dateRange.end
                  ? `${format(parseISO(dateRange.start), 'dd MMM')} - ${format(parseISO(dateRange.end), 'dd MMM')}`
                  : `${format(new Date(), 'MMMM yyyy')} Overview`}
              </h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70">Expenditure Intelligence Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {budgetWarnings.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-200/50 backdrop-blur-md animate-pulse">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-tight">Budget Risk: {budgetWarnings.length} Categories</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBudgetOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent-purple bg-white/50 hover:bg-white/80 rounded-xl transition-all border border-white/40 shadow-sm"
              >
                <Target size={14} /> Budgets
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent-purple bg-white/50 hover:bg-white/80 rounded-xl transition-all border border-white/40 shadow-sm"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-accent-purple hover:bg-accent-purple/90 rounded-xl transition-all shadow-lg shadow-accent-purple/30"
              >
                <Plus size={14} /> Add Transaction
              </button>
            </div>
            <button
              onClick={() => setIsProfileOpen(true)}
              title={user.email ?? undefined}
              className="h-11 w-11 rounded-2xl bg-accent-purple/10 flex items-center justify-center border border-white/60 shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-accent-purple/30 transition-all"
            >
              <Avatar photoURL={user.photoURL} name={user.displayName} email={user.email} className="w-full h-full flex items-center justify-center" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 pt-4 max-w-[1700px] mx-auto w-full mb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'tracker' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                  title="Monthly Intake"
                  subtitle="Capital Basis"
                  value={totals.incomeTotal}
                  variant="primary"
                  icon={ArrowDownCircle}
                  onEdit={() => setIsProfileOpen(true)}
                />
                <StatsCard title="Current Burn" value={totals.total} variant="secondary" icon={RefreshCcw} />
                <StatsCard title="Treasury Reserve" value={totals.remaining} variant="accent" icon={Wallet} />
                <StatsCard title="Fiscal Day" value={format(new Date(), 'EEEE, dd')} variant="neutral" icon={Calendar} />
              </div>

              <div className="grid grid-cols-12 gap-10">
                {/* Left Side: Ledger Trace */}
                <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
                  <div className="px-4 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Execution Trace</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">Latest verified settlements</p>
                    </div>
                  </div>
                  <ExpenseTable
                    expenses={filteredExpenses.slice(0, 10)}
                    accounts={accounts}
                    onEditExpense={(expense) => {
                      setEditingExpense(expense);
                      setIsAddOpen(true);
                    }}
                    onDeleteExpense={deleteExpense}
                  />
                </div>

                {/* Right Side: Charts & Capital */}
                <div className="col-span-12 xl:col-span-4 space-y-10">
                  <div className="glass p-8 bg-white/60 backdrop-blur-3xl border-white shadow-2xl rounded-[2.5rem]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 text-center">Resource Allocation</h3>
                    <DashboardCharts expenses={totals.filteredList} />
                  </div>

                  <div className="glass p-12 shadow-2xl border-white/50 text-center space-y-10 bg-white/60 backdrop-blur-3xl rounded-[3rem]">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capital Reserve</h3>
                    <div className="py-2">
                       <h2 className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">Rs {totals.remaining.toLocaleString()}</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Remaining Liquidity</p>
                    </div>
                    <div className="inline-flex p-8 glass bg-white shadow-xl shadow-accent-purple/10 border-white rounded-[2.5rem] text-accent-purple">
                      <Wallet size={48} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Category Intelligence</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Detailed allocation & capacity analysis</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(Object.keys(categorySummary) as Category[]).map(cat => {
                  const spent = categorySummary[cat];
                  const budget = budgets.find(b => b.category === cat);
                  const isOver = budget && budget.limit > 0 && spent > budget.limit;
                  const percent = budget?.limit ? (spent / budget.limit) * 100 : (spent > 0 ? 100 : 0);

                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab('categories');
                      }}
                      className={cn(
                        "glass p-10 flex flex-col gap-8 shadow-2xl transition-all hover:translate-y-[-8px] text-left hover:bg-white/80 rounded-[3rem] group",
                        isOver ? "bg-rose-50/50 border-rose-200" : "bg-white/50 border-white"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className={cn(
                          "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110",
                          cat === 'Food' ? 'bg-emerald-400 shadow-emerald-400/30' :
                          cat === 'Transport' ? 'bg-blue-400 shadow-blue-400/30' :
                          cat === 'Bills' ? 'bg-amber-400 shadow-amber-400/30' :
                          cat === 'Shopping' ? 'bg-indigo-400 shadow-indigo-400/30' :
                          cat === 'Entertainment' ? 'bg-rose-400 shadow-rose-400/30' : 'bg-slate-400 shadow-slate-400/30'
                        )}>
                          <Wallet size={24} />
                        </div>
                        {isOver && <AlertCircle className="text-rose-500 animate-bounce" size={24} />}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{cat} Vault</span>
                        <h4 className="text-3xl font-black text-slate-900 tabular-nums">Rs {spent.toLocaleString()}</h4>
                        {budget?.limit ? (
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Limit: Rs {budget.limit.toLocaleString()}</p>
                        ) : (
                          <p className="text-[10px] font-bold text-slate-400 uppercase">No Limit Defined</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                          <span>Capacity</span>
                          <span className={cn(isOver ? "text-rose-600" : "")}>{Math.round(percent)}%</span>
                        </div>
                        <div className="w-full h-4 bg-white shadow-inner rounded-full overflow-hidden border border-white/40">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percent, 100)}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              isOver ? "bg-rose-500" : (
                                cat === 'Food' ? 'bg-emerald-400' :
                                cat === 'Transport' ? 'bg-blue-400' :
                                cat === 'Bills' ? 'bg-amber-400' :
                                cat === 'Shopping' ? 'bg-indigo-400' :
                                cat === 'Entertainment' ? 'bg-rose-400' : 'bg-slate-400'
                              )
                            )}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[9px] font-black uppercase tracking-widest text-accent-purple flex items-center gap-2">
                           View Entries <ArrowUpCircle size={12} className="rotate-90" />
                         </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Settlement Registry</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Historical transaction sequence</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <DateFilter
                      startDate={dateRange.start}
                      endDate={dateRange.end}
                      onDateChange={(start, end) => setDateRange({ start, end })}
                      onClear={() => setDateRange({ start: '', end: '' })}
                    />
                    <div className="flex gap-2 p-2 glass bg-white/40 rounded-2xl overflow-x-auto no-scrollbar">
                         {['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Others'].map((cat) => (
                           <button
                             key={cat}
                             onClick={() => setSelectedCategory(selectedCategory === cat ? undefined : cat as Category)}
                             className={cn(
                               "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                               selectedCategory === cat
                                ? "bg-accent-purple text-white shadow-lg shadow-accent-purple/20"
                                : "hover:bg-white/60 text-slate-500"
                             )}
                           >
                             {cat}
                           </button>
                         ))}
                         {selectedCategory && (
                           <button
                             onClick={() => setSelectedCategory(undefined)}
                             className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50"
                           >
                             Reset
                           </button>
                         )}
                    </div>
                </div>
              </div>

              <ExpenseTable
                expenses={filteredExpenses}
                accounts={accounts}
                onEditExpense={(expense) => {
                  setEditingExpense(expense);
                  setIsAddOpen(true);
                }}
                onDeleteExpense={deleteExpense}
              />
            </motion.div>
          )}

          {activeTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AccountsTab
                accounts={accounts}
                accountBalances={accountBalances}
                transfers={transfers}
                onUpdateStartingBalance={updateAccountStartingBalance}
                onAddTransfer={addTransfer}
                onDeleteTransfer={deleteTransfer}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation - Bottom Fixed Glass Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-6">
        <nav className="glass-darker p-2 backdrop-blur-2xl shadow-2xl border-white/50 flex justify-between items-center rounded-2xl">
          <TabButton active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} icon={LayoutDashboard} label="Dashboard" />
          <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={BarChart3} label="Insights" />
          <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={ListFilter} label="Ledger" />
          <TabButton active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} icon={Landmark} label="Accounts" />
          <div className="w-px h-8 bg-white/20 mx-2"></div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-accent-purple text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-accent-purple/40 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={16} /> New Entry
          </button>
        </nav>
      </div>

      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        incomeEntries={income}
        balance={allTimeBalance}
        accounts={accounts}
        onAddIncome={addIncome}
        onDeleteIncome={deleteIncome}
        onLogout={signOutUser}
      />

      <AddExpenseForm
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingExpense(null);
        }}
        onAdd={addExpense}
        onUpdate={updateExpense}
        editExpense={editingExpense}
        accounts={accounts}
      />

      <BudgetSettings
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        budgets={budgets}
        onSave={async (newBudgets) => {
          setBudgets(newBudgets);
          await storage.saveBudgets(user.uid, newBudgets);
        }}
      />
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-2xl transition-all",
        active
          ? "bg-white text-accent-purple font-black shadow-lg shadow-accent-purple/10"
          : "text-slate-400 font-bold hover:text-slate-600 hover:bg-white/50"
      )}
    >
      <Icon size={18} strokeWidth={active ? 3 : 2} />
      <span className="text-[10px] uppercase tracking-widest">{label}</span>
    </button>
  );
}
