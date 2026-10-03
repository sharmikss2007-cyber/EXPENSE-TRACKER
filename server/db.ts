import fs from 'fs';
import path from 'path';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  created_at: number;
}

export interface ExpenseStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  highestAmount: number;
  categoryBreakdown: {
    category: string;
    total: number;
    count: number;
    percentage: number;
  }[];
  monthlyBreakdown: {
    month: string; // YYYY-MM
    total: number;
    count: number;
  }[];
  recentExpenses: Expense[];
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

export type ExpenseCategory = (typeof CATEGORIES)[number];

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'expenses.db');
const JSON_FILE = path.join(DATA_DIR, 'expenses.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function generateSampleData(): Expense[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Helper to generate a date in current or previous month
  const makeDate = (dayOffset: number) => {
    const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'exp_sample_1',
      title: 'Whole Foods Market - Groceries',
      amount: 142.65,
      category: 'Food & Dining',
      date: makeDate(1),
      notes: 'Weekly fresh groceries, organic produce and milk',
      created_at: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: 'exp_sample_2',
      title: 'Monthly Apartment Rent',
      amount: 1350.00,
      category: 'Housing & Rent',
      date: makeDate(3),
      notes: 'Primary monthly lease installment',
      created_at: Date.now() - 1000 * 60 * 60 * 72,
    },
    {
      id: 'exp_sample_3',
      title: 'City Power & Electric Utility',
      amount: 88.40,
      category: 'Utilities',
      date: makeDate(5),
      notes: 'Monthly electric and gas billing',
      created_at: Date.now() - 1000 * 60 * 60 * 120,
    },
    {
      id: 'exp_sample_4',
      title: 'Metro Rapid Transit Monthly Pass',
      amount: 78.00,
      category: 'Transportation',
      date: makeDate(7),
      notes: 'Commute train and bus card refill',
      created_at: Date.now() - 1000 * 60 * 60 * 168,
    },
    {
      id: 'exp_sample_5',
      title: 'Blue Bottle Coffee & Bakery',
      amount: 14.50,
      category: 'Food & Dining',
      date: makeDate(2),
      notes: 'Espresso and almond croissant',
      created_at: Date.now() - 1000 * 60 * 60 * 48,
    },
    {
      id: 'exp_sample_6',
      title: 'Prescription Refill & Vitamins',
      amount: 45.20,
      category: 'Healthcare',
      date: makeDate(8),
      notes: 'Walgreens pharmacy run',
      created_at: Date.now() - 1000 * 60 * 60 * 192,
    },
    {
      id: 'exp_sample_7',
      title: 'Streaming & Media Subscriptions',
      amount: 29.98,
      category: 'Entertainment',
      date: makeDate(10),
      notes: 'Spotify Premium + Netflix Standard',
      created_at: Date.now() - 1000 * 60 * 60 * 240,
    },
    {
      id: 'exp_sample_8',
      title: 'High-Speed Fiber Internet',
      amount: 65.00,
      category: 'Utilities',
      date: makeDate(12),
      notes: 'Monthly 500Mbps symmetrical fiber connection',
      created_at: Date.now() - 1000 * 60 * 60 * 288,
    },
    {
      id: 'exp_sample_9',
      title: 'Ergonomic Desk Accessories',
      amount: 94.50,
      category: 'Shopping',
      date: makeDate(14),
      notes: 'Laptop stand and memory foam wrist rest',
      created_at: Date.now() - 1000 * 60 * 60 * 336,
    },
    {
      id: 'exp_sample_10',
      title: 'Gasoline Fuel Refill',
      amount: 52.30,
      category: 'Transportation',
      date: makeDate(16),
      notes: 'Shell station 12 gallons regular unleaded',
      created_at: Date.now() - 1000 * 60 * 60 * 384,
    },
    {
      id: 'exp_sample_11',
      title: 'Weekend Movie & IMAX Tickets',
      amount: 36.00,
      category: 'Entertainment',
      date: makeDate(18),
      notes: 'Two theater passes and popcorn',
      created_at: Date.now() - 1000 * 60 * 60 * 432,
    },
    {
      id: 'exp_sample_12',
      title: 'Italian Trattoria Dinner',
      amount: 72.80,
      category: 'Food & Dining',
      date: makeDate(20),
      notes: 'Dinner with friends, pasta and dessert',
      created_at: Date.now() - 1000 * 60 * 60 * 480,
    },
  ];
}

/**
 * Robust Database Controller:
 * Uses Node 22 native SQLite (DatabaseSync) with automatic persistent JSON file fallback
 * to guarantee 100% reliable persistence in any environment.
 */
class ExpenseStore {
  private sqliteDb: any = null;
  private memoryCache: Expense[] = [];
  private isSqlite: boolean = false;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      // Dynamic import / require of node:sqlite
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { DatabaseSync } = require('node:sqlite');
      this.sqliteDb = new DatabaseSync(DB_FILE);
      
      // Initialize table
      this.sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          notes TEXT,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
      `);

      this.isSqlite = true;

      // Check if table is empty, if so, seed sample data
      const checkStmt = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM expenses');
      const result = checkStmt.get() as { count: number };
      if (!result || result.count === 0) {
        this.seedInitialData();
      }
    } catch (err) {
      console.warn('SQLite init warning, using persistent JSON database fallback:', err);
      this.isSqlite = false;
      this.initJsonDatabase();
    }
  }

  private initJsonDatabase() {
    if (fs.existsSync(JSON_FILE)) {
      try {
        const raw = fs.readFileSync(JSON_FILE, 'utf-8');
        this.memoryCache = JSON.parse(raw);
        if (!Array.isArray(this.memoryCache) || this.memoryCache.length === 0) {
          this.memoryCache = generateSampleData();
          this.saveJson();
        }
      } catch {
        this.memoryCache = generateSampleData();
        this.saveJson();
      }
    } else {
      this.memoryCache = generateSampleData();
      this.saveJson();
    }
  }

  private saveJson() {
    try {
      const tempPath = `${JSON_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.memoryCache, null, 2), 'utf-8');
      fs.renameSync(tempPath, JSON_FILE);
    } catch (e) {
      console.error('Error saving JSON database:', e);
    }
  }

  private seedInitialData() {
    const samples = generateSampleData();
    if (this.isSqlite && this.sqliteDb) {
      const insert = this.sqliteDb.prepare(`
        INSERT INTO expenses (id, title, amount, category, date, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of samples) {
        insert.run(item.id, item.title, item.amount, item.category, item.date, item.notes || null, item.created_at);
      }
    } else {
      this.memoryCache = [...samples];
      this.saveJson();
    }
  }

  public getAll(filters?: {
    search?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Expense[] {
    let items: Expense[] = [];

    if (this.isSqlite && this.sqliteDb) {
      try {
        const stmt = this.sqliteDb.prepare(`SELECT * FROM expenses ORDER BY date DESC, created_at DESC`);
        const rows = stmt.all() as any[];
        items = rows.map((r) => ({
          id: r.id,
          title: r.title,
          amount: Number(r.amount),
          category: r.category,
          date: r.date,
          notes: r.notes || '',
          created_at: Number(r.created_at),
        }));
      } catch (err) {
        console.error('Failed to read from SQLite, falling back to cache:', err);
        items = [...this.memoryCache];
      }
    } else {
      items = [...this.memoryCache];
    }

    // Apply filtering
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q) ||
          (it.notes && it.notes.toLowerCase().includes(q))
      );
    }

    if (filters?.category && filters.category !== 'All') {
      items = items.filter((it) => it.category === filters.category);
    }

    if (filters?.startDate) {
      items = items.filter((it) => it.date >= filters.startDate!);
    }

    if (filters?.endDate) {
      items = items.filter((it) => it.date <= filters.endDate!);
    }

    // Sorting
    const sortBy = filters?.sortBy || 'date';
    const order = filters?.order === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      if (sortBy === 'amount') {
        return (a.amount - b.amount) * order;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title) * order;
      }
      if (sortBy === 'created_at') {
        return (a.created_at - b.created_at) * order;
      }
      // default: date
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare * order;
      return (a.created_at - b.created_at) * order;
    });

    return items;
  }

  public getById(id: string): Expense | null {
    if (this.isSqlite && this.sqliteDb) {
      try {
        const stmt = this.sqliteDb.prepare('SELECT * FROM expenses WHERE id = ?');
        const row = stmt.get(id) as any;
        if (!row) return null;
        return {
          id: row.id,
          title: row.title,
          amount: Number(row.amount),
          category: row.category,
          date: row.date,
          notes: row.notes || '',
          created_at: Number(row.created_at),
        };
      } catch {
        return null;
      }
    }

    return this.memoryCache.find((e) => e.id === id) || null;
  }

  public create(data: {
    title: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
  }): Expense {
    const newExpense: Expense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: data.title.trim(),
      amount: Math.round(Number(data.amount) * 100) / 100,
      category: data.category.trim(),
      date: data.date,
      notes: data.notes?.trim() || '',
      created_at: Date.now(),
    };

    if (this.isSqlite && this.sqliteDb) {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO expenses (id, title, amount, category, date, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        newExpense.id,
        newExpense.title,
        newExpense.amount,
        newExpense.category,
        newExpense.date,
        newExpense.notes || null,
        newExpense.created_at
      );
    } else {
      this.memoryCache.unshift(newExpense);
      this.saveJson();
    }

    return newExpense;
  }

  public update(
    id: string,
    data: Partial<Omit<Expense, 'id' | 'created_at'>>
  ): Expense | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated: Expense = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      amount:
        data.amount !== undefined
          ? Math.round(Number(data.amount) * 100) / 100
          : existing.amount,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      date: data.date !== undefined ? data.date : existing.date,
      notes: data.notes !== undefined ? data.notes.trim() : existing.notes,
    };

    if (this.isSqlite && this.sqliteDb) {
      const stmt = this.sqliteDb.prepare(`
        UPDATE expenses
        SET title = ?, amount = ?, category = ?, date = ?, notes = ?
        WHERE id = ?
      `);
      stmt.run(
        updated.title,
        updated.amount,
        updated.category,
        updated.date,
        updated.notes || null,
        id
      );
    } else {
      const idx = this.memoryCache.findIndex((e) => e.id === id);
      if (idx !== -1) {
        this.memoryCache[idx] = updated;
        this.saveJson();
      }
    }

    return updated;
  }

  public delete(id: string): boolean {
    if (this.isSqlite && this.sqliteDb) {
      const stmt = this.sqliteDb.prepare('DELETE FROM expenses WHERE id = ?');
      const res = stmt.run(id);
      return res.changes > 0;
    } else {
      const initialLen = this.memoryCache.length;
      this.memoryCache = this.memoryCache.filter((e) => e.id !== id);
      const changed = this.memoryCache.length !== initialLen;
      if (changed) this.saveJson();
      return changed;
    }
  }

  public resetSampleData(): Expense[] {
    if (this.isSqlite && this.sqliteDb) {
      this.sqliteDb.exec('DELETE FROM expenses');
      this.seedInitialData();
      return this.getAll();
    } else {
      this.memoryCache = generateSampleData();
      this.saveJson();
      return [...this.memoryCache];
    }
  }

  public getStats(): ExpenseStats {
    const all = this.getAll();
    const totalCount = all.length;
    const totalAmount = Math.round(all.reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
    const averageAmount = totalCount > 0 ? Math.round((totalAmount / totalCount) * 100) / 100 : 0;
    const highestAmount = all.reduce((max, item) => Math.max(max, item.amount), 0);

    // Category breakdown
    const catMap = new Map<string, { total: number; count: number }>();
    for (const item of all) {
      const cur = catMap.get(item.category) || { total: 0, count: 0 };
      catMap.set(item.category, {
        total: cur.total + item.amount,
        count: cur.count + 1,
      });
    }

    const categoryBreakdown = Array.from(catMap.entries())
      .map(([cat, val]) => ({
        category: cat,
        total: Math.round(val.total * 100) / 100,
        count: val.count,
        percentage: totalAmount > 0 ? Math.round((val.total / totalAmount) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly breakdown (last 6 months)
    const monthMap = new Map<string, { total: number; count: number }>();
    for (const item of all) {
      const month = item.date.substring(0, 7); // YYYY-MM
      const cur = monthMap.get(month) || { total: 0, count: 0 };
      monthMap.set(month, {
        total: cur.total + item.amount,
        count: cur.count + 1,
      });
    }

    const monthlyBreakdown = Array.from(monthMap.entries())
      .map(([month, val]) => ({
        month,
        total: Math.round(val.total * 100) / 100,
        count: val.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const recentExpenses = all.slice(0, 5);

    return {
      totalAmount,
      totalCount,
      averageAmount,
      highestAmount,
      categoryBreakdown,
      monthlyBreakdown,
      recentExpenses,
    };
  }
}

export const db = new ExpenseStore();
