export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  created_at: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyBreakdown {
  month: string;
  total: number;
  count: number;
}

export interface ExpenseStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  highestAmount: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyBreakdown: MonthlyBreakdown[];
  recentExpenses: Expense[];
}

export interface ExpenseFormData {
  title: string;
  amount: string; // string in input, parsed to number
  category: string;
  date: string;
  notes: string;
}

export interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
  date?: string;
  general?: string;
}

export interface ExpenseFilters {
  search: string;
  category: string;
  startDate: string;
  endDate: string;
  sortBy: 'date' | 'amount' | 'title';
  order: 'asc' | 'desc';
}

export const CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Utilities',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Personal Care',
  'Other',
] as const;

export type CategoryName = (typeof CATEGORIES)[number];
