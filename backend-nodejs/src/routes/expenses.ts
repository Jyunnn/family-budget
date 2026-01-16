import { Router, Request, Response } from 'express';
import db from '../config/database';
import { generateId, isValidDate } from '../utils/dateUtils';
import { expenseCreateSchema, expenseUpdateSchema } from '../validators/validators';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query;

  if (!from || !to) {
    throw new ValidationError('Missing date range.');
  }

  if (!isValidDate(from as string) || !isValidDate(to as string)) {
    throw new ValidationError('Invalid date format.');
  }

  const expenses = db.prepare(`
    SELECT Id, Date, MemberId, CategoryId, Amount, Note, IsFromHousehold, HouseholdAccountId
    FROM Expenses
    WHERE Date >= ? AND Date <= ?
    ORDER BY Date DESC, CreatedAt DESC
  `).all(from, to) as Array<{
    Id: string;
    Date: string;
    MemberId: string | null;
    CategoryId: string;
    Amount: number;
    Note: string | null;
    IsFromHousehold: number;
    HouseholdAccountId: string | null;
  }>;

  const result = expenses.map(e => ({
    id: e.Id,
    date: e.Date,
    memberId: e.MemberId,
    categoryId: e.CategoryId,
    amount: e.Amount,
    note: e.Note,
    isFromHousehold: e.IsFromHousehold === 1,
    householdAccountId: e.HouseholdAccountId
  }));

  res.json(result);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = expenseCreateSchema.parse(req.body);

  const { date, memberId, categoryId, amount, note, isFromHousehold = false, householdAccountId } = validatedData;

  if (!isValidDate(date)) {
    throw new ValidationError('Invalid expense date.');
  }

  const categoryCheck = db.prepare('SELECT COUNT(1) as count FROM Categories WHERE Id = ?').get(categoryId) as { count: number };
  if (categoryCheck.count === 0) {
    throw new ValidationError('Category not found.');
  }

  const id = generateId('e');

  db.prepare('BEGIN TRANSACTION').run();

  try {
    if (isFromHousehold) {
      if (!householdAccountId) {
        throw new ValidationError('Household account ID is required for household expenses.');
      }

      const accountCheck = db.prepare('SELECT COUNT(1) as count, CurrentBalance FROM HouseholdAccounts WHERE Id = ?').get(householdAccountId) as { count: number; CurrentBalance: number };
      if (accountCheck.count === 0) {
        throw new ValidationError('Household account not found.');
      }

      db.prepare('INSERT INTO Expenses (Id, Date, MemberId, CategoryId, Amount, Note, IsFromHousehold, HouseholdAccountId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, date, null, categoryId, amount, note, 1, householdAccountId);

      const transactionId = generateId('t');
      db.prepare('INSERT INTO Transactions (Id, Type, Amount, Date, HouseholdAccountId, ExpenseId, Note) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(transactionId, 'PAYMENT', amount, date, householdAccountId, id, note);

      db.prepare('UPDATE HouseholdAccounts SET CurrentBalance = CurrentBalance - ? WHERE Id = ?').run(amount, householdAccountId);
    } else {
      if (!memberId) {
        throw new ValidationError('Member ID is required for member expenses.');
      }

      const memberCheck = db.prepare('SELECT COUNT(1) as count FROM Members WHERE Id = ?').get(memberId) as { count: number };
      if (memberCheck.count === 0) {
        throw new ValidationError('Member not found.');
      }

      db.prepare('INSERT INTO Expenses (Id, Date, MemberId, CategoryId, Amount, Note, IsFromHousehold, HouseholdAccountId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, date, memberId, categoryId, amount, note, 0, null);
    }

    db.prepare('COMMIT').run();

    const responseData: any = {
      id,
      date,
      categoryId,
      amount,
      note,
      isFromHousehold,
      householdAccountId
    };

    if (!isFromHousehold) {
      responseData.memberId = memberId;
    }

    res.status(201).json(responseData);
  } catch (error) {
    db.prepare('ROLLBACK').run();
    throw error;
  }
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = expenseUpdateSchema.parse(req.body);

  const { date, memberId, categoryId, amount, note, isFromHousehold, householdAccountId } = validatedData;

  if (!isValidDate(date)) {
    throw new ValidationError('Invalid expense date.');
  }

  const categoryCheck = db.prepare('SELECT COUNT(1) as count FROM Categories WHERE Id = ?').get(categoryId) as { count: number };
  if (categoryCheck.count === 0) {
    throw new ValidationError('Category not found.');
  }

  const existingExpense = db.prepare('SELECT Id, MemberId, IsFromHousehold, HouseholdAccountId, Amount FROM Expenses WHERE Id = ?').get(id) as {
    Id: string;
    MemberId: string | null;
    IsFromHousehold: number;
    HouseholdAccountId: string | null;
    Amount: number;
  } | undefined;

  if (!existingExpense) {
    throw new NotFoundError('Expense not found.');
  }

  db.prepare('BEGIN TRANSACTION').run();

  try {
    const newIsFromHousehold = isFromHousehold !== undefined ? isFromHousehold : (existingExpense.IsFromHousehold === 1);
    const newMemberId = newIsFromHousehold ? null : (memberId || existingExpense.MemberId);
    const newHouseholdAccountId = newIsFromHousehold ? (householdAccountId || existingExpense.HouseholdAccountId) : null;
    const newAmount = amount !== undefined ? amount : existingExpense.Amount;

    if (newIsFromHousehold && !newHouseholdAccountId) {
      throw new ValidationError('Household account ID is required for household expenses.');
    }

    if (!newIsFromHousehold && !newMemberId) {
      throw new ValidationError('Member ID is required for member expenses.');
    }

    if (newIsFromHousehold) {
      const accountCheck = db.prepare('SELECT COUNT(1) as count FROM HouseholdAccounts WHERE Id = ?').get(newHouseholdAccountId) as { count: number };
      if (accountCheck.count === 0) {
        throw new ValidationError('Household account not found.');
      }
    } else {
      const memberCheck = db.prepare('SELECT COUNT(1) as count FROM Members WHERE Id = ?').get(newMemberId) as { count: number };
      if (memberCheck.count === 0) {
        throw new ValidationError('Member not found.');
      }
    }

    if (existingExpense.IsFromHousehold === 1 && existingExpense.HouseholdAccountId) {
      const oldTransaction = db.prepare('SELECT Id FROM Transactions WHERE ExpenseId = ?').get(id) as { Id: string } | undefined;
      if (oldTransaction) {
        db.prepare('UPDATE HouseholdAccounts SET CurrentBalance = CurrentBalance + ? WHERE Id = ?').run(existingExpense.Amount, existingExpense.HouseholdAccountId);
        db.prepare('DELETE FROM Transactions WHERE Id = ?').run(oldTransaction.Id);
      }
    }

    db.prepare('UPDATE Expenses SET Date = ?, MemberId = ?, CategoryId = ?, Amount = ?, Note = ?, IsFromHousehold = ?, HouseholdAccountId = ? WHERE Id = ?')
      .run(date, newMemberId, categoryId, newAmount, note, newIsFromHousehold ? 1 : 0, newHouseholdAccountId, id);

    if (newIsFromHousehold && newHouseholdAccountId) {
      const transactionId = generateId('t');
      db.prepare('INSERT INTO Transactions (Id, Type, Amount, Date, HouseholdAccountId, ExpenseId, Note) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(transactionId, 'PAYMENT', newAmount, date, newHouseholdAccountId, id, note);
      db.prepare('UPDATE HouseholdAccounts SET CurrentBalance = CurrentBalance - ? WHERE Id = ?').run(newAmount, newHouseholdAccountId);
    }

    db.prepare('COMMIT').run();

    res.json({
      id,
      date,
      memberId: newMemberId,
      categoryId,
      amount: newAmount,
      note,
      isFromHousehold: newIsFromHousehold,
      householdAccountId: newHouseholdAccountId
    });
  } catch (error) {
    db.prepare('ROLLBACK').run();
    throw error;
  }
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const expense = db.prepare('SELECT Id, IsFromHousehold, HouseholdAccountId, Amount FROM Expenses WHERE Id = ?').get(id) as {
    Id: string;
    IsFromHousehold: number;
    HouseholdAccountId: string | null;
    Amount: number;
  } | undefined;

  if (!expense) {
    throw new NotFoundError('Expense not found.');
  }

  db.prepare('BEGIN TRANSACTION').run();

  try {
    if (expense.IsFromHousehold === 1 && expense.HouseholdAccountId) {
      const transaction = db.prepare('SELECT Id FROM Transactions WHERE ExpenseId = ?').get(id) as { Id: string } | undefined;
      if (transaction) {
        db.prepare('UPDATE HouseholdAccounts SET CurrentBalance = CurrentBalance + ? WHERE Id = ?').run(expense.Amount, expense.HouseholdAccountId);
        db.prepare('DELETE FROM Transactions WHERE Id = ?').run(transaction.Id);
      }
    }

    db.prepare('DELETE FROM Expenses WHERE Id = ?').run(id);

    db.prepare('COMMIT').run();

    res.status(204).send();
  } catch (error) {
    db.prepare('ROLLBACK').run();
    throw error;
  }
}));

export default router;
