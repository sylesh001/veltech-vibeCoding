import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BudgetModal from '../components/BudgetModal';

export default function Budgets() {
  const { api, user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets/');
      setBudgets(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStyleForStatus = (percentage = 0) => {
    const p = typeof percentage === 'number' ? percentage : parseFloat(percentage) || 0;
    if (p >= 100) return { iconColor: 'text-[#C62828]', iconBg: 'bg-[#FFEBEE]', barColor: 'bg-error', borderColor: 'border-[#ffdad6]' };
    if (p >= 80) return { iconColor: 'text-[#EF6C00]', iconBg: 'bg-[#FFF3E0]', barColor: 'bg-[#FF9800]', borderColor: 'border-surface-container-low' };
    return { iconColor: 'text-[#2E7D32]', iconBg: 'bg-[#E8F5E9]', barColor: 'bg-[#4CAF50]', borderColor: 'border-surface-container-low' };
  };

  const formatCurrency = (amount) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(val);
  };

  const totalRemaining = budgets.reduce((sum, b) => {
    const rem = (parseFloat(b.amount) || 0) - (parseFloat(b.actual_expense) || 0);
    return sum + (rem > 0 ? rem : 0);
  }, 0);

  return (
    <div className="space-y-xl pb-xl">
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">Monthly Budgets</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Track your spending limits for the current month.</p>
        </div>
        <div className="bg-surface-container-low p-sm rounded-xl inline-flex items-center gap-sm self-start md:self-auto shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-container-high">
          <span className="font-label-md text-label-md text-on-surface-variant">Total Remaining:</span>
          <span className="font-headline-md text-headline-md text-primary">{formatCurrency(totalRemaining)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {loading ? (
           <p className="text-on-surface-variant">Loading budgets...</p>
        ) : budgets.length === 0 ? (
           <p className="text-on-surface-variant">No budgets set.</p>
        ) : (
          budgets.map(budget => {
            const style = getStyleForStatus(budget.utilization_percentage);
            const spent = parseFloat(budget.actual_expense) || 0;
            const limit = parseFloat(budget.amount) || 0;
            const percentage = Math.min(parseFloat(budget.utilization_percentage) || 0, 100);

            return (
              <div key={budget.id} className={`bg-surface-container-lowest rounded-[24px] p-lg shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border ${style.borderColor} flex flex-col gap-md relative overflow-hidden group hover:shadow-[0px_10px_32px_rgba(0,0,0,0.08)] transition-all duration-300`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-sm">
                    <div className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center ${style.iconColor}`}>
                      <span className="material-symbols-outlined">category</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">{budget.category_name || (typeof budget.category === 'string' ? budget.category : '') || 'All Categories'}</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{budget.month}/{budget.year}</p>
                    </div>
                  </div>
                  <button className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                </div>
                <div className="mt-sm">
                  <div className="flex justify-between items-end mb-xs">
                    <span className={`font-headline-md text-headline-md ${budget.utilization_percentage >= 100 ? 'text-error' : 'text-on-surface'}`}>
                      {formatCurrency(spent)}
                    </span>
                    <span className={`font-label-sm text-label-sm ${budget.utilization_percentage >= 100 ? 'text-error' : 'text-on-surface-variant'}`}>
                      of {formatCurrency(limit)} spent {budget.utilization_percentage >= 100 ? '(Over)' : ''}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full ${style.barColor} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <button onClick={() => setIsModalOpen(true)} className="bg-surface-container-low border border-dashed border-outline-variant hover:border-primary hover:bg-surface-container transition-all duration-300 rounded-[24px] p-lg flex flex-col items-center justify-center gap-sm min-h-[200px] text-on-surface-variant hover:text-primary active:scale-95 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-highest group-hover:bg-primary-container group-hover:text-on-primary-container flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-2xl">add</span>
          </div>
          <span className="font-headline-md text-headline-md">Create New Budget</span>
        </button>
      </div>

      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBudgets} 
      />
    </div>
  )
}
