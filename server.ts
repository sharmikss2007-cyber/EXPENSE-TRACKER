import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, CATEGORIES } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes

/**
 * GET /api/categories
 * Returns list of allowed categories
 */
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json({ categories: CATEGORIES });
});

/**
 * GET /api/expenses
 * Query params: search, category, startDate, endDate, sortBy, order
 */
app.get('/api/expenses', (req: Request, res: Response) => {
  try {
    const { search, category, startDate, endDate, sortBy, order } = req.query;

    const expenses = db.getAll({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      order: order === 'asc' ? 'asc' : 'desc',
    });

    res.json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve expenses' });
  }
});

/**
 * GET /api/expenses/stats
 * Returns summary metrics, category breakdown, monthly trends
 */
app.get('/api/expenses/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate stats' });
  }
});

/**
 * GET /api/expenses/:id
 */
app.get('/api/expenses/:id', (req: Request, res: Response) => {
  try {
    const expense = db.getById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, expense });
  } catch (error: any) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve expense' });
  }
});

/**
 * POST /api/expenses
 * Create a new expense with validation
 */
app.post('/api/expenses', (req: Request, res: Response) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    const errors: Record<string, string> = {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.title = 'Expense title/name is required.';
    } else if (title.trim().length > 150) {
      errors.title = 'Expense title cannot exceed 150 characters.';
    }

    const parsedAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount)) {
      errors.amount = 'Valid amount is required.';
    } else if (parsedAmount <= 0) {
      errors.amount = 'Amount must be greater than $0.00.';
    } else if (parsedAmount > 10000000) {
      errors.amount = 'Amount cannot exceed $10,000,000.';
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      errors.category = 'Category is required.';
    }

    if (!date || typeof date !== 'string') {
      errors.date = 'Date is required.';
    } else {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        errors.date = 'Invalid date format.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const created = db.create({
      title: title.trim(),
      amount: parsedAmount,
      category: category.trim(),
      date: date.substring(0, 10),
      notes: typeof notes === 'string' ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense: created,
    });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, message: 'Internal server error creating expense' });
  }
});

/**
 * PUT /api/expenses/:id
 * Update an existing expense
 */
app.put('/api/expenses/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, notes } = req.body;

    const existing = db.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const errors: Record<string, string> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        errors.title = 'Expense title cannot be empty.';
      }
    }

    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        errors.amount = 'Amount must be a positive number.';
      }
    }

    if (date !== undefined) {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) {
        errors.date = 'Invalid date.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const updated = db.update(id, {
      title,
      amount: amount !== undefined ? Number(amount) : undefined,
      category,
      date: date ? date.substring(0, 10) : undefined,
      notes,
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updated,
    });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, message: 'Internal server error updating expense' });
  }
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense
 */
app.delete('/api/expenses/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const deleted = db.delete(id);
    if (deleted) {
      res.json({ success: true, message: 'Expense deleted successfully', id });
    } else {
      res.status(500).json({ success: false, message: 'Could not delete expense' });
    }
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, message: 'Internal server error deleting expense' });
  }
});

/**
 * POST /api/expenses/reset-sample
 * Resets database back to rich sample data
 */
app.post('/api/expenses/reset-sample', (_req: Request, res: Response) => {
  try {
    const expenses = db.resetSampleData();
    res.json({
      success: true,
      message: 'Sample data restored successfully',
      expenses,
      stats: db.getStats(),
    });
  } catch (error: any) {
    console.error('Error resetting sample data:', error);
    res.status(500).json({ success: false, message: 'Failed to reset sample data' });
  }
});

/**
 * POST /api/ai/parse-expense
 * Useful helper: Parses natural language expense like "Dinner with Sarah $48.50 on Friday"
 * or receipt note into { title, amount, category, date, notes }
 */
app.post('/api/ai/parse-expense', async (req: Request, res: Response) => {
  const { input } = req.body;
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ success: false, message: 'Input text is required' });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Try Gemini if GEMINI_API_KEY is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI();
      const prompt = `You are a financial parsing assistant. The user enters a natural language expense or receipt text: "${input}".
Today's date is: ${todayStr}.
Available categories are: ${CATEGORIES.join(', ')}.

Return ONLY valid JSON matching this schema with no markdown formatting:
{
  "title": string (clean title of the purchase/vendor),
  "amount": number (positive dollar amount without symbol),
  "category": string (best matching category from the list),
  "date": string (YYYY-MM-DD),
  "notes": string (brief context or details extracted)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.amount === 'number' && parsed.title) {
          return res.json({
            success: true,
            data: {
              title: parsed.title,
              amount: parsed.amount,
              category: CATEGORIES.includes(parsed.category) ? parsed.category : 'Other',
              date: parsed.date || todayStr,
              notes: parsed.notes || '',
            },
          });
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini parse fallback engaged:', geminiErr);
    }
  }

  // Graceful rule-based heuristic parser fallback
  try {
    let text = input.trim();
    // Match amounts like $12.34 or 12.34 or 15
    const amountMatch = text.match(/\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    
    // Guess category from keywords
    const lower = text.toLowerCase();
    let category = 'Other';
    if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('coffee') || lower.includes('grocer') || lower.includes('restaurant') || lower.includes('cafe')) {
      category = 'Food & Dining';
    } else if (lower.includes('rent') || lower.includes('mortgage') || lower.includes('apartment')) {
      category = 'Housing & Rent';
    } else if (lower.includes('uber') || lower.includes('gas') || lower.includes('bus') || lower.includes('train') || lower.includes('flight') || lower.includes('transit')) {
      category = 'Transportation';
    } else if (lower.includes('electric') || lower.includes('water') || lower.includes('wifi') || lower.includes('internet') || lower.includes('power')) {
      category = 'Utilities';
    } else if (lower.includes('movie') || lower.includes('netflix') || lower.includes('concert') || lower.includes('game') || lower.includes('spotify')) {
      category = 'Entertainment';
    } else if (lower.includes('doctor') || lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('dentist')) {
      category = 'Healthcare';
    } else if (lower.includes('clothes') || lower.includes('shoes') || lower.includes('amazon') || lower.includes('buy')) {
      category = 'Shopping';
    }

    // Clean title by removing amount
    let title = text.replace(/\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/, '').replace(/\b(for|on|at|yesterday|today)\b/gi, ' ').trim();
    if (!title) title = 'Expense';

    res.json({
      success: true,
      data: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        amount: amount || 10,
        category,
        date: todayStr,
        notes: `Quickly added from: "${input}"`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Could not parse input' });
  }
});

// Setup Vite or Static Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
