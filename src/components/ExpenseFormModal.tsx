import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { CATEGORIES, ExpenseFormData, FormErrors } from '../types';
import { getCategoryInfo } from '../utils/categories';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<boolean>;
  initialData?: Partial<ExpenseFormData>;
  title?: string;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Add New Expense',
}) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    amount: '',
    category: CATEGORIES[0],
    date: getTodayString(),
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [isParsingQuick, setIsParsingQuick] = useState(false);
  const [quickParseSuccess, setQuickParseSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        amount: initialData?.amount !== undefined ? String(initialData.amount) : '',
        category: initialData?.category || CATEGORIES[0],
        date: initialData?.date || getTodayString(),
        notes: initialData?.notes || '',
      });
      setErrors({});
      setQuickInput('');
      setQuickParseSuccess(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Expense name or merchant is required';
    } else if (formData.title.trim().length > 150) {
      newErrors.title = 'Name must be 150 characters or less';
    }

    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than $0.00';
    } else if (numAmount > 10000000) {
      newErrors.amount = 'Amount cannot exceed $10,000,000';
    }

    if (!formData.category) {
      newErrors.category = 'Please select an expense category';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const d = new Date(formData.date);
      if (isNaN(d.getTime())) {
        newErrors.date = 'Invalid date selected';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || 'Failed to save expense. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickParse = async () => {
    if (!quickInput.trim()) return;
    setIsParsingQuick(true);
    setQuickParseSuccess(false);

    try {
      const res = await fetch('/api/ai/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: quickInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFormData({
          title: data.data.title || '',
          amount: data.data.amount ? String(data.data.amount) : '',
          category: data.data.category || CATEGORIES[0],
          date: data.data.date || getTodayString(),
          notes: data.data.notes || '',
        });
        setErrors({});
        setQuickParseSuccess(true);
        setTimeout(() => setQuickParseSuccess(false), 2500);
      }
    } catch (e) {
      console.warn('Quick parse error:', e);
    } finally {
      setIsParsingQuick(false);
    }
  };

  const selectedCategoryMeta = getCategoryInfo(formData.category);
  const CategoryIcon = selectedCategoryMeta.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">Record a new outgoing transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Natural Language Assistant */}
        <div className="px-6 pt-4 pb-1">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Quick Auto-Fill (Natural Language)
              </span>
              {quickParseSuccess && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Auto-filled!
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickParse();
                  }
                }}
                placeholder='e.g., "Lunch with client $28.50" or "Shell gas $45"'
                className="flex-1 text-xs px-3 py-1.5 bg-white border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleQuickParse}
                disabled={isParsingQuick || !quickInput.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-100/80 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isParsingQuick ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  'Fill'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Expense Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Expense Name / Merchant <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="e.g., Grocery Shopping at Trader Joe's"
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if (errors.amount) setErrors({ ...errors, amount: undefined });
                  }}
                  placeholder="0.00"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm font-semibold bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.amount
                      ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (errors.date) setErrors({ ...errors, date: undefined });
                  }}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.date
                      ? 'border-rose-300 focus:ring-rose-400 focus:border-rose-400'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: undefined });
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {/* Category tag badge preview */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Selected:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${selectedCategoryMeta.bgLight}`}
              >
                <CategoryIcon className="w-3 h-3" />
                {formData.category}
              </span>
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes / Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional details, invoice numbers, or payment method..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Expense</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
