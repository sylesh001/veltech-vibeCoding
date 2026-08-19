import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, setUser, api } = useAuth();
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [message, setMessage] = useState('');
  
  const [history, setHistory] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (user && user.currency) {
      setCurrency(user.currency);
    }
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/expenses/sync-history/');
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Save theme to local storage and apply
    localStorage.setItem('theme', theme);
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save currency to backend
    try {
      const res = await api.patch('/auth/profile/', {
        currency
      });
      setUser(res.data);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setMessage('Failed to save settings.');
    }
  };

  const handleResetData = async () => {
    if (confirmText !== 'CONFIRM') {
      setResetError('You must type CONFIRM to delete all data.');
      return;
    }
    setResetError('');
    setResetMessage('');
    try {
      const res = await api.delete('/expenses/reset/');
      setResetMessage(res.data.message);
      setShowConfirm(false);
      setConfirmText('');
      fetchHistory(); // refresh history to show the reset action
    } catch (err) {
      setResetError('Failed to reset data.');
    }
  };

  return (
    <div className="font-sans text-on-surface">
      <main className="w-full max-w-container-max mx-auto transition-all">
        <h1 className="text-display-sm font-display-sm mb-8">Settings</h1>
        
        <div className="max-w-2xl bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant">
          <h2 className="text-headline-sm font-headline-sm mb-6">Preferences</h2>
          {message && <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-body-md">{message}</div>}
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Display Theme</label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface appearance-none"
              >
                <option value="system">System Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
            
            <div>
              <label className="block text-label-md font-label-md text-on-surface-variant mb-2">Default Currency</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-lg hover:bg-primary/90 transition-colors">
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Data Sync History */}
        <div className="max-w-2xl bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant mt-8">
          <h2 className="text-headline-sm font-headline-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">history</span>
            Data Sync History
          </h2>
          {history.length === 0 ? (
            <p className="text-on-surface-variant text-body-md">No import or export history found.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
              {history.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-highest">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.action === 'import' ? 'bg-primary/20 text-primary' : item.action === 'export' ? 'bg-secondary/20 text-secondary' : 'bg-error/20 text-error'}`}>
                    <span className="material-symbols-outlined">
                      {item.action === 'import' ? 'download' : item.action === 'export' ? 'upload' : 'delete_forever'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-on-surface capitalize">{item.action}</h4>
                    <p className="text-body-sm text-on-surface-variant mb-1">{item.details}</p>
                    <p className="text-label-sm text-outline">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="max-w-2xl bg-error-container/10 rounded-2xl p-6 shadow-sm border border-error/30 mt-8 mb-16">
          <h2 className="text-headline-sm font-headline-sm mb-2 text-error flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Danger Zone
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Deleting all transactions is a permanent action and cannot be undone. This will wipe out all your financial history (Incomes and Expenses).
          </p>

          {resetMessage && <div className="mb-4 p-3 bg-primary/10 text-primary rounded-lg text-body-md">{resetMessage}</div>}
          {resetError && <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-body-md">{resetError}</div>}

          {!showConfirm ? (
            <button 
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2 bg-error text-on-error rounded-full font-label-lg hover:bg-error/90 transition-colors"
            >
              Reset All Transactions
            </button>
          ) : (
            <div className="bg-surface-container p-4 rounded-xl border border-error/50">
              <p className="text-body-md text-on-surface mb-3 font-medium">Are you absolutely sure?</p>
              <p className="text-body-sm text-on-surface-variant mb-4">Type <strong>CONFIRM</strong> to permanently delete your data.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="CONFIRM"
                  className="flex-1 px-4 py-2 bg-surface-container-lowest border border-error rounded-lg text-body-md focus:outline-none focus:ring-1 focus:ring-error text-on-surface"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetData}
                    className="px-4 py-2 bg-error text-on-error rounded-lg font-label-lg hover:bg-error/90 transition-colors"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmText('');
                      setResetError('');
                    }}
                    className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-lg font-label-lg hover:bg-outline-variant transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
