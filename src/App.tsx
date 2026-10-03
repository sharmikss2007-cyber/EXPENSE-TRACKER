import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Expense, ExpenseStats, ExpenseFilters, ExpenseFormData } from './types';
import { AlertCircle, RefreshCw, Plus } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    category: 'All',
    startDate: '',
    endDate: '',
    sortBy: 'date',
    order: 'desc',
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch expenses and stats
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.order) params.append('order', filters.order);

      const [expensesRes, statsRes] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`),
        fetch('/api/expenses/stats'),
      ]);

      if (!expensesRes.ok || !statsRes.ok) {
        throw new Error('Could not connect to the backend server.');
      }

      const expensesData = await expensesRes.json();
      const statsData = await statsRes.json();

      if (expensesData.success) {
        setExpenses(expensesData.expenses);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setApiError(err.message || 'Failed to communicate with database server.');
      addToast('error', 'Connection Error', 'Failed to retrieve expenses from backend.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Total and count for filtered view
  const filteredTotal = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const isFiltered = useMemo(() => {
    return (
      Boolean(filters.search) ||
      filters.category !== 'All' ||
      Boolean(filters.startDate) ||
      Boolean(filters.endDate)
    );
  }, [filters]);

  // Handle Create Expense
  const handleCreateExpense = async (formData: ExpenseFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create expense');
      }

      addToast('success', 'Expense Saved', `${data.expense.title} was recorded successfully.`);
      fetchData();
      return true;
    } catch (err: any) {
      addToast('error', 'Creation Failed', err.message);
      throw err;
    }
  };

  // Handle Edit Expense
  const handleUpdateExpense = async (formData: ExpenseFormData): Promise<boolean> => {
    if (!editingExpense) return false;
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update expense');
      }

      addToast('success', 'Expense Updated', 'Changes were saved successfully.');
      setEditingExpense(null);
      fetchData();
      return true;
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  // Handle Delete Expense
  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deletingExpense.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete expense');
      }

      addToast('info', 'Expense Deleted', `${deletingExpense.title} has been removed.`);
      setDeletingExpense(null);
      fetchData();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Reset with Sample Data
  const handleResetSample = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/expenses/reset-sample', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset sample data');
      }

      addToast('success', 'Sample Data Restored', '12 realistic expense records were seeded.');
      fetchData();
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['ID', 'Date', 'Expense Title', 'Category', 'Amount (USD)', 'Notes'];
    const rows = expenses.map((e) => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount.toFixed(2),
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `trackflow_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'CSV Exported', 'Downloaded expense history to your device.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetSample={handleResetSample}
        onExportCSV={handleExportCSV}
        isResetting={isResetting}
        totalExpensesCount={stats?.totalCount || expenses.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* API Error Banner if any */}
        {apiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Top Analytics & Dashboard Stats */}
        <section aria-label="Dashboard Overview">
          <DashboardStats
            stats={stats}
            filteredTotal={filteredTotal}
            filteredCount={expenses.length}
            isFiltered={isFiltered}
          />
        </section>

        {/* Expenses Table & Management */}
        <section aria-label="Expenses Table" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Expense Transactions
              </h2>
              <p className="text-xs text-slate-500">
                Persistent database records with live search, filters, and management
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New</span>
              </button>
            </div>
          </div>

          <ExpenseTable
            expenses={expenses}
            filters={filters}
            onFilterChange={setFilters}
            onEditExpense={(exp) => setEditingExpense(exp)}
            onDeleteExpense={(exp) => setDeletingExpense(exp)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onResetSample={handleResetSample}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            TrackFlow • Practice Full-Stack Application with SQLite Database Persistence
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Client &amp; Server in Sync</span>
            <span>•</span>
            <span>Port 3000</span>
          </div>
        </div>
      </footer>

      {/* Add Expense Modal */}
      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateExpense}
        title="Add New Expense"
      />

      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseFormModal
          isOpen={Boolean(editingExpense)}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleUpdateExpense}
          initialData={{
            title: editingExpense.title,
            amount: String(editingExpense.amount),
            category: editingExpense.category,
            date: editingExpense.date,
            notes: editingExpense.notes || '',
          }}
          title="Edit Expense"
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingExpense)}
        expense={deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
