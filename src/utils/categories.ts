import React from 'react';
import {
  Utensils,
  Home,
  Zap,
  Car,
  HeartPulse,
  Film,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  Tag,
  LucideIcon,
} from 'lucide-react';

export interface CategoryInfo {
  name: string;
  icon: LucideIcon;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryInfo> = {
  'Food & Dining': {
    name: 'Food & Dining',
    icon: Utensils,
    color: '#f97316', // orange
    bgLight: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
  },
  'Housing & Rent': {
    name: 'Housing & Rent',
    icon: Home,
    color: '#3b82f6', // blue
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
  },
  'Utilities': {
    name: 'Utilities',
    icon: Zap,
    color: '#eab308', // yellow
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-600',
  },
  'Transportation': {
    name: 'Transportation',
    icon: Car,
    color: '#06b6d4', // cyan
    bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-600',
  },
  'Healthcare': {
    name: 'Healthcare',
    icon: HeartPulse,
    color: '#ec4899', // pink
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-600',
  },
  'Entertainment': {
    name: 'Entertainment',
    icon: Film,
    color: '#8b5cf6', // purple
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-600',
  },
  'Shopping': {
    name: 'Shopping',
    icon: ShoppingBag,
    color: '#10b981', // emerald
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-600',
  },
  'Education': {
    name: 'Education',
    icon: GraduationCap,
    color: '#6366f1', // indigo
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-600',
  },
  'Personal Care': {
    name: 'Personal Care',
    icon: Sparkles,
    color: '#14b8a6', // teal
    bgLight: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-600',
  },
  'Other': {
    name: 'Other',
    icon: Tag,
    color: '#64748b', // slate
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-600',
  },
};

export function getCategoryInfo(categoryName: string): CategoryInfo {
  return (
    CATEGORY_CONFIG[categoryName] || {
      name: categoryName || 'Other',
      icon: Tag,
      color: '#64748b',
      bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
      borderColor: 'border-slate-400',
      textColor: 'text-slate-600',
    }
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}
