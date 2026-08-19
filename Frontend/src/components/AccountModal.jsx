import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AccountModal({ isOpen, onClose, onSuccess }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0
      };

      await api.post('/accounts/', payload);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        type: 'bank',
        balance: ''
      });
    } catch (error) {
      console.error(error);
      alert('Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
          <h2 className="text-headline-md font-headline-md text-on-surface">Add Account</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="account-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Account Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" placeholder="e.g. Main Bank, Cash Wallet" />
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Account Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none">
                <option value="bank">Bank</option>
                <option value="wallet">Wallet</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Starting Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                <input required type="number" step="0.01" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} className="w-full pl-8 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" placeholder="0.00" />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-surface-container-high bg-surface-container-lowest sticky bottom-0 z-10 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-label-lg font-label-lg rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            Cancel
          </button>
          <button type="submit" form="account-form" disabled={loading} className="flex-1 py-3 text-label-lg font-label-lg rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
}
