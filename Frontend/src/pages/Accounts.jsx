import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountModal from '../components/AccountModal';

export default function Accounts() {
  const { api, user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts/');
      setAccounts(response.data.results || response.data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountIcon = (type) => {
    const t = (type || '').toLowerCase();
    switch (t) {
      case 'bank': return { icon: 'account_balance', bg: 'bg-primary-container/20', text: 'text-primary' };
      case 'wallet': return { icon: 'wallet', bg: 'bg-surface-container-high', text: 'text-on-surface-variant' };
      case 'card': return { icon: 'credit_card', bg: 'bg-error-container', text: 'text-error' };
      case 'cash': return { icon: 'payments', bg: 'bg-success-container/20', text: 'text-success' };
      default: return { icon: 'savings', bg: 'bg-surface-variant', text: 'text-primary-fixed-variant' };
    }
  };

  const totalAssets = accounts.filter(a => (parseFloat(a.balance) || 0) >= 0).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
  const totalLiabilities = accounts.filter(a => (parseFloat(a.balance) || 0) < 0).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
  const netWorth = totalAssets + totalLiabilities;

  const formatCurrency = (amount) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD' }).format(val);
  };

  return (
    <div className="space-y-xl pb-xl">
      <header className="mb-8">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Accounts</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Manage your balances and financial sources.</p>
      </header>

      <section className="mb-xl">
        <div className="bg-surface-lowest rounded-xl p-lg card-shadow border border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-label-md text-label-md text-on-surface-variant block mb-1">Net Worth</span>
            <h2 className="font-display text-display text-primary">{formatCurrency(netWorth)}</h2>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <span className="font-label-sm text-label-sm text-on-surface-variant block">Total Assets</span>
              <span className="font-headline-md text-headline-md text-on-surface">{formatCurrency(totalAssets)}</span>
            </div>
            <div className="text-right pl-4 border-l border-outline-variant">
              <span className="font-label-sm text-label-sm text-on-surface-variant block">Total Liabilities</span>
              <span className="font-headline-md text-headline-md text-error">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-xl">
        {loading ? (
           <p className="text-on-surface-variant">Loading accounts...</p>
        ) : (
          accounts.map(account => {
            const style = getAccountIcon(account.type);
            const balance = parseFloat(account.balance) || 0;
            return (
              <div key={account.id} className="bg-surface-lowest rounded-xl p-lg card-shadow hover:shadow-[0px_10px_32px_rgba(0,0,0,0.08)] transition-shadow border border-surface-container cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.text}`}>
                    <span className="material-symbols-outlined" data-icon={style.icon}>{style.icon}</span>
                  </div>
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
                  </button>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{account.name}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-4 capitalize">{account.type} Account</p>
                  <p className={`font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg ${balance < 0 ? 'text-error' : (balance > 0 ? 'text-primary' : 'text-on-surface')}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <button onClick={() => setIsModalOpen(true)} className="bg-surface-container-lowest rounded-xl p-lg border border-dashed border-outline-variant flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary hover:border-primary transition-all min-h-[200px]">
          <span className="material-symbols-outlined mb-2 text-[32px]" data-icon="add_circle">add_circle</span>
          <span className="font-headline-md text-headline-md">Add Account</span>
        </button>
      </section>

      <AccountModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAccounts} 
      />
    </div>
  )
}
