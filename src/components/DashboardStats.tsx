import React from 'react';
import { ExpenseStats } from '../types';
import { formatCurrency, getCategoryInfo } from '../utils/categories';
import {
  DollarSign,
  TrendingDown,
  Layers,
  PieChart,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardStatsProps {
  stats: ExpenseStats | null;
  filteredTotal: number;
  filteredCount: number;
  isFiltered: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  filteredTotal,
  filteredCount,
  isFiltered,
}) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const displayTotal = isFiltered ? filteredTotal : stats.totalAmount;
  const displayCount = isFiltered ? filteredCount : stats.totalCount;
  const topCategory = stats.categoryBreakdown[0];

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isFiltered ? 'Filtered Total' : 'Total Expenses'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(displayTotal)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{displayCount}</span>
              <span>{displayCount === 1 ? 'transaction' : 'transactions'}</span>
              {isFiltered && (
                <span className="text-indigo-600 font-medium ml-1">
                  (of {stats.totalCount} total)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Average Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Expense
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(stats.averageAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              <span>Per logged purchase</span>
            </div>
          </div>
        </div>

        {/* Card 3: Largest Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Largest Purchase
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(stats.highestAmount)}
            </div>
            <div className="mt-1 text-xs text-slate-500 truncate">
              {stats.recentExpenses.length > 0
                ? 'Single highest item'
                : 'No transactions yet'}
            </div>
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between relative z-10 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Top Category
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {topCategory ? topCategory.category : 'None'}
            </div>
            <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
              {topCategory ? (
                <>
                  <span className="font-semibold text-emerald-600">
                    {topCategory.percentage}%
                  </span>
                  <span>of all spending ({formatCurrency(topCategory.total)})</span>
                </>
              ) : (
                'Add an expense to start'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bar Section */}
      {stats.categoryBreakdown.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Category Spending Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {stats.categoryBreakdown.length} active categories
            </span>
          </div>

          {/* Multi-segment stacked bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {stats.categoryBreakdown.map((item) => {
              const meta = getCategoryInfo(item.category);
              return (
                <div
                  key={item.category}
                  style={{
                    width: `${Math.max(item.percentage, 1)}%`,
                    backgroundColor: meta.color,
                  }}
                  title={`${item.category}: ${formatCurrency(item.total)} (${item.percentage}%)`}
                  className="h-full transition-all duration-300 hover:opacity-85"
                />
              );
            })}
          </div>

          {/* Legend items */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {stats.categoryBreakdown.map((item) => {
              const meta = getCategoryInfo(item.category);
              return (
                <div
                  key={item.category}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-slate-100 bg-slate-50/70"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {formatCurrency(item.total)}
                  </span>
                  <span className="text-slate-500 font-semibold text-[11px]">
                    ({item.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
