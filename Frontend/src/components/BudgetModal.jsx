import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BudgetModal({ isOpen, onClose, onSuccess }) {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  React.useEffect(() => {
    if (isOpen) {
      api.get('/categories/').then(res => {
        const data = res.data.results || res.data;
        setCategories(data.filter(c => c.type === 'expense'));
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        category: formData.category ? parseInt(formData.category) : null,
        amount: parseFloat(formData.amount) || 0,
        month: parseInt(formData.month),
        year: parseInt(formData.year)
      };

      await api.post('/budgets/', payload);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        category: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.non_field_errors) {
        alert(error.response.data.non_field_errors[0]);
      } else {
        alert('Failed to save budget. Please check inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest sticky top-0 z-10">
          <h2 className="text-headline-md font-headline-md text-on-surface">Create Budget</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="budget-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Category</label>
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none">
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Monthly Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
                <input required type="number" step="0.01" min="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full pl-8 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" placeholder="0.00" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Month</label>
                <select required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface appearance-none">
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Year</label>
                <input required type="number" min="2000" max="2100" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" placeholder="YYYY" />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-surface-container-high bg-surface-container-lowest sticky bottom-0 z-10 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-label-lg font-label-lg rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors">
            Cancel
          </button>
          <button type="submit" form="budget-form" disabled={loading} className="flex-1 py-3 text-label-lg font-label-lg rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
}
