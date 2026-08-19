import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function Dashboard() {
  const { api, user } = useAuth();
  const [data, setData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    recentTransactions: [],
    categoryData: [],
    trendData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accountsRes, expensesRes, incomesRes] = await Promise.all([
        api.get('/accounts/'),
        api.get('/expenses/'),
        api.get('/incomes/')
      ]);

      const accounts = accountsRes.data.results || accountsRes.data;
      const expenses = expensesRes.data.results || expensesRes.data;
      const incomes = incomesRes.data.results || incomesRes.data;

      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyExpenses = expenses
        .filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      const monthlyIncome = incomes
        .filter(i => {
          const d = new Date(i.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, i) => sum + parseFloat(i.amount), 0);

      const mappedExpenses = expenses.map(e => ({
        id: `exp_${e.id}`,
        title: e.category_name || (typeof e.category === 'string' ? e.category : '') || 'Expense',
        subtitle: e.payment_method || 'Expense',
        amount: - (parseFloat(e.amount) || 0),
        date: new Date(e.date),
        type: 'expense'
      }));

      const mappedIncomes = incomes.map(i => ({
        id: `inc_${i.id}`,
        title: i.category_name || i.source || (typeof i.category === 'string' ? i.category : '') || 'Income',
        subtitle: "Income",
        amount: parseFloat(i.amount) || 0,
        date: new Date(i.date),
        type: 'income'
      }));

      const merged = [...mappedExpenses, ...mappedIncomes].sort((a, b) => b.date - a.date).slice(0, 5);

      // Compute category data
      const categoryMap = {};
      expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).forEach(e => {
        const catName = e.category_name || (typeof e.category === 'string' ? e.category : '') || 'Other';
        if (!categoryMap[catName]) categoryMap[catName] = 0;
        categoryMap[catName] += parseFloat(e.amount) || 0;
      });
      const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

      // Compute trend data (last 5 months)
      const trendMap = {};
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
        trendMap[monthKey] = { name: monthKey, Income: 0, Expense: 0 };
      }

      incomes.forEach(i => {
        const d = new Date(i.date);
        const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
        if (trendMap[monthKey]) {
          trendMap[monthKey].Income += parseFloat(i.amount) || 0;
        }
      });

      expenses.forEach(e => {
        const d = new Date(e.date);
        const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
        if (trendMap[monthKey]) {
          trendMap[monthKey].Expense += parseFloat(e.amount) || 0;
        }
      });
      
      const trendData = Object.values(trendMap);

      setData({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        recentTransactions: merged,
        categoryData,
        trendData
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD', signDisplay: 'always' }).format(val);
  };

  const getCurrencySymbol = () => {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).formatToParts(0);
    return parts.find(p => p.type === 'currency')?.value || '$';
  };

  const getIcon = (type, title) => {
    if (type === 'income') return { icon: 'work', bg: 'bg-success/20', text: 'text-success' };
    const t = (title || '').toString().toLowerCase();
    if (t.includes('grocer') || t.includes('food')) return { icon: 'shopping_cart', bg: 'bg-tertiary-fixed', text: 'text-tertiary' };
    if (t.includes('transport') || t.includes('ride') || t.includes('uber')) return { icon: 'directions_car', bg: 'bg-primary-fixed', text: 'text-primary' };
    if (t.includes('rent') || t.includes('home')) return { icon: 'home', bg: 'bg-secondary-container', text: 'text-on-secondary-container' };
    return { icon: 'receipt_long', bg: 'bg-surface-variant', text: 'text-on-surface-variant' };
  };

  return (
    <div className="space-y-xl pb-xl">
      <section className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-lg flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">Total Balance</span>
            <span className="material-symbols-outlined text-outline">account_balance_wallet</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            {loading ? '...' : formatCurrency(data.totalBalance).replace('+', '')}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-lg flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0YWRlODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMyA2IDEzLjUgMTUuNSA4LjUgMTAuNSAxIDI4Ij48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9IjE3IDYgMjMgNiAyMyAxMiI+PC9wb2x5bGluZT48L3N2Zz4=')] opacity-5 bg-no-repeat bg-right-top mt-4 mr-4"></div>
          <div className="flex items-center justify-between z-10">
            <span className="font-label-md text-label-md text-on-surface-variant">Monthly Income</span>
            <span className="material-symbols-outlined text-primary-container">arrow_upward</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-[#10b981] z-10">
            {loading ? '...' : formatCurrency(data.monthlyIncome)}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-lg flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmOTczMTYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMyAxOCAxMy41IDguNSA4LjUgMTMuNSAxIC00Ij48L3BvbHlsaW5lPjxwb2x5bGluZSBwb2ludHM9IjE3IDE4IDIzIDE4IDIzIDEyIj48L3BvbHlsaW5lPjwvc3ZnPg==')] opacity-5 bg-no-repeat bg-right-top mt-4 mr-4"></div>
          <div className="flex items-center justify-between z-10">
            <span className="font-label-md text-label-md text-on-surface-variant">Monthly Expenses</span>
            <span className="material-symbols-outlined text-error">arrow_downward</span>
          </div>
          <div className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-[#f97316] z-10">
            {loading ? '...' : formatCurrency(-data.monthlyExpenses)}
          </div>
        </div>
      </section>

      <section className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-lg mt-xl">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-lg flex flex-col">
          <h3 className="font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface mb-lg">Spending by Category</h3>
          <div className="flex-grow flex items-center justify-center relative min-h-[250px]">
            {loading ? '...' : data.categoryData.length === 0 ? <p className="text-on-surface-variant">No expenses this month</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => {
                      const COLORS = ['#003ec7', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#eab308'];
                      return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!loading && data.categoryData.length > 0 && (
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="font-body-md text-body-md text-on-surface-variant">Total</span>
                <span className="font-headline-md text-headline-md text-on-surface">
                  {formatCurrency(data.monthlyExpenses).replace('+', '')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-lg flex flex-col">
          <h3 className="font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface mb-lg">Income vs. Expenses</h3>
          <div className="flex-grow flex items-end justify-between pt-4 min-h-[250px] relative">
            {loading ? '...' : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} tickFormatter={(value) => `${getCurrencySymbol()}${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                  <Tooltip cursor={{ fill: 'var(--color-surface-container-low)' }} formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Expense" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="col-span-1 md:col-span-12 mt-xl mb-xl">
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-lg">
          <div className="flex justify-between items-center mb-lg">
            <h3 className="font-headline-md text-headline-md-mobile md:text-headline-md text-on-surface">Recent Transactions</h3>
            <Link to="/transactions" className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">View All</Link>
          </div>
          <div className="flex flex-col">
            {loading ? (
              <p className="text-on-surface-variant">Loading transactions...</p>
            ) : data.recentTransactions.length === 0 ? (
              <p className="text-on-surface-variant">No transactions found.</p>
            ) : (
              data.recentTransactions.map(tx => {
                const style = getIcon(tx.type, tx.title);
                const dateStr = tx.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                  <div key={tx.id} className="flex items-center justify-between py-sm border-b border-outline-variant/30 last:border-0">
                    <div className="flex items-center gap-md">
                      <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.text}`}>
                        <span className="material-symbols-outlined">{style.icon}</span>
                      </div>
                      <div>
                        <p className="font-body-md text-body-md text-on-surface">{tx.title}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{tx.subtitle} • {dateStr}</p>
                      </div>
                    </div>
                    <span className={`font-body-md text-body-md font-semibold ${tx.amount < 0 ? 'text-on-surface' : 'text-success'}`}>
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
