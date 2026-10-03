import React from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Calendar,
  XCircle,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Expense, ExpenseFilters, CATEGORIES } from '../types';
import { formatCurrency, formatDate, getCategoryInfo } from '../utils/categories';

interface ExpenseTableProps {
  expenses: Expense[];
  filters: ExpenseFilters;
  onFilterChange: (filters: ExpenseFilters) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onOpenAddModal: () => void;
  onResetSample: () => void;
  isLoading: boolean;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  filters,
  onFilterChange,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
  onResetSample,
  isLoading,
}) => {
  const isFiltered =
    Boolean(filters.search) ||
    filters.category !== 'All' ||
    Boolean(filters.startDate) ||
    Boolean(filters.endDate);

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'All',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      order: 'desc',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Controls & Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search by expense name, category, or note..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={filters.category}
                onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                className="text-xs sm:text-sm py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${filters.sortBy}-${filters.order}`}
                onChange={(e) => {
                  const [sortBy, order] = e.target.value.split('-') as [
                    'date' | 'amount' | 'title',
                    'asc' | 'desc',
                  ];
                  onFilterChange({ ...filters, sortBy, order });
                }}
                className="text-xs sm:text-sm py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Amount: High to Low</option>
                <option value="amount-asc">Amount: Low to High</option>
                <option value="title-asc">Name: A to Z</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Date Range filter bar (optional collapsible / row) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/50 text-xs text-slate-600">
          <span className="font-medium flex items-center gap-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5" /> Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
              className="py-1 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
              className="py-1 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={() => onFilterChange({ ...filters, startDate: '', endDate: '' })}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Expense Details</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Amount</th>
              <th className="py-3.5 px-4 sm:px-6 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              // Loading Skeleton
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="h-4 bg-slate-200 rounded-sm w-48 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded-sm w-32"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-slate-200 rounded-md w-24"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded-sm w-20"></div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="h-4 bg-slate-200 rounded-sm w-16 ml-auto"></div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="h-6 bg-slate-200 rounded-md w-14 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : expenses.length > 0 ? (
              expenses.map((expense) => {
                const categoryMeta = getCategoryInfo(expense.category);
                const IconComponent = categoryMeta.icon;

                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Title & Notes */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-slate-900 text-sm">
                        {expense.title}
                      </div>
                      {expense.notes && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {expense.notes}
                        </div>
                      )}
                    </td>

                    {/* Category badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${categoryMeta.bgLight}`}
                      >
                        <IconComponent className="w-3.5 h-3.5 shrink-0" />
                        <span>{expense.category}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditExpense(expense)}
                          title="Edit Expense"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(expense)}
                          title="Delete Expense"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              // Empty State
              <tr>
                <td colSpan={5} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {isFiltered ? 'No matching expenses found' : 'No expenses recorded yet'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {isFiltered
                          ? 'Try changing your search terms, category, or date range filter.'
                          : 'Get started by creating your first expense or load sample data.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      {isFiltered ? (
                        <button
                          onClick={clearFilters}
                          className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={onOpenAddModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Add Expense
                          </button>
                          <button
                            onClick={onResetSample}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Load Sample Data
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      {!isLoading && expenses.length > 0 && (
        <div className="p-3.5 sm:p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <span className="font-semibold text-slate-800">{expenses.length}</span>{' '}
            {expenses.length === 1 ? 'record' : 'records'}
            {isFiltered && <span className="text-indigo-600 ml-1">(filtered)</span>}
          </div>
          <div className="font-mono">
            Subtotal:{' '}
            <span className="font-bold text-slate-900 text-sm">
              {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
