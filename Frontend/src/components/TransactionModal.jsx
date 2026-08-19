import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TransactionModal({ isOpen, onClose, onSuccess }) {
  const { api } = useAuth();
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '', // shared field for category ID
    payment_method: 'Card',
    note: '',
    account: ''
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        api.get('/accounts/'),
        api.get('/categories/')
      ]).then(([accountsRes, categoriesRes]) => {
        const accountsData = accountsRes.data.results || accountsRes.data;
        const categoriesData = categoriesRes.data.results || categoriesRes.data;
        
        setAccounts(accountsData);
        setCategories(categoriesData);

        setFormData(prev => ({
          ...prev,
          account: prev.account || (accountsData.length > 0 ? accountsData[0].id : ''),
        }));
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        note: formData.note,
        account: formData.account ? parseInt(formData.account) : null,
        category: formData.category ? parseInt(formData.category) : null
      };

      if (type === 'expense') {
        payload.payment_method = formData.payment_method;
        await api.post('/expenses/', payload);
      } else {
        await api.post('/incomes/', payload);
      }
      onSuccess();
      onClose();
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        payment_method: 'Card',
        note: '',
        account: accounts.length > 0 ? accounts[0].id : ''
      });
    } catch (error) {
      console.error(error);
      alert('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
          <h2 className="text-headline-md font-headline-md text-on-surface">Add Transaction</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex p-1 bg-surface-container-low rounded-lg mb-6">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-label-md font-label-md rounded-md transition-all ${type === 'expense' ? 'bg-surface-container-lowest shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Expense
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-label-md font-label-md rounded-md transition-all ${type === 'income' ? 'bg-surface-container-lowest shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Income
            </button>
          </div>

          <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                <input required type="number" step="0.01" min="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full pl-8 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Account</label>
                <select disabled={accounts.length === 0} value={formData.account} onChange={e => setFormData({...formData, account: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none disabled:opacity-50">
                  <option value="">{accounts.length === 0 ? "No accounts available" : "Select Account"}</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none disabled:opacity-50">
                  <option value="" disabled>Select Category</option>
                  {categories.filter(c => c.type === type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {type === 'expense' && (
                <div>
                  <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Payment Method</label>
                  <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none">
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Note (Optional)</label>
              <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} rows="2" className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface resize-none" placeholder="Add a note..."></textarea>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-surface-container-high bg-surface-container-lowest sticky bottom-0 z-10 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-label-lg font-label-lg rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            Cancel
          </button>
          <button type="submit" form="transaction-form" disabled={loading} className="flex-1 py-3 text-label-lg font-label-lg rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
}
