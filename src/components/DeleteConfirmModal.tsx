import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/categories';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  expense,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Delete Expense</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-5 text-sm space-y-1">
          <div className="font-semibold text-slate-900">{expense.title}</div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{expense.category} • {formatDate(expense.date)}</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatCurrency(expense.amount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
