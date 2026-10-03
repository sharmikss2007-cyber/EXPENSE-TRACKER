import React from 'react';
import {
  Wallet,
  PlusCircle,
  RotateCcw,
  Download,
  Sparkles,
  TrendingDown,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onResetSample: () => void;
  onExportCSV: () => void;
  isResetting: boolean;
  totalExpensesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onResetSample,
  onExportCSV,
  isResetting,
  totalExpensesCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">TrackFlow</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 rounded-full">
                  Full Stack
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Persistent Personal Expense Tracker &amp; Analytics
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onResetSample}
              disabled={isResetting}
              title="Reset with pre-populated sample transactions for testing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sample Data</span>
            </button>

            {totalExpensesCount > 0 && (
              <button
                onClick={onExportCSV}
                title="Download CSV spreadsheet of all expenses"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Export CSV</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
