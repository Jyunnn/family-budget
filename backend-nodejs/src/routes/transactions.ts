import { Router, Request, Response } from 'express';
import db from '../config/database';
import { generateId } from '../utils/dateUtils';
import { depositCreateSchema, transactionQuerySchema } from '../validators/validators';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = transactionQuerySchema.parse(req.query);

  let whereClauses: string[] = [];
  let params: any[] = [];

  if (validatedQuery.accountId) {
    whereClauses.push('T.HouseholdAccountId = ?');
    params.push(validatedQuery.accountId);
  }

  if (validatedQuery.from) {
    whereClauses.push('T.Date >= ?');
    params.push(validatedQuery.from);
  }

  if (validatedQuery.to) {
    whereClauses.push('T.Date <= ?');
    params.push(validatedQuery.to);
  }

  if (validatedQuery.type && validatedQuery.type !== 'ALL') {
    whereClauses.push('T.Type = ?');
    params.push(validatedQuery.type);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const transactions = db.prepare(`
    SELECT
      T.Id,
      T.Type,
      T.Amount,
      T.Date,
      T.HouseholdAccountId,
      T.MemberId,
      T.ExpenseId,
      T.Note,
      M.Name as MemberName,
      C.Name as CategoryName,
      E.Note as ExpenseNote
    FROM Transactions T
    LEFT JOIN Members M ON T.MemberId = M.Id
    LEFT JOIN Expenses E ON T.ExpenseId = E.Id
    LEFT JOIN Categories C ON E.CategoryId = C.Id
    ${whereClause}
    ORDER BY T.Date DESC, T.CreatedAt DESC
  `).all(...params) as Array<{
    Id: string;
    Type: string;
    Amount: number;
    Date: string;
    HouseholdAccountId: string;
    MemberId: string | null;
    ExpenseId: string | null;
    Note: string | null;
    MemberName: string | null;
    CategoryName: string | null;
    ExpenseNote: string | null;
  }>;

  const result = transactions.map(t => ({
    id: t.Id,
    type: t.Type,
    amount: t.Amount,
    date: t.Date,
    householdAccountId: t.HouseholdAccountId,
    memberId: t.MemberId,
    memberName: t.MemberName,
    expenseId: t.ExpenseId,
    categoryName: t.CategoryName,
    expenseNote: t.ExpenseNote,
    note: t.Note
  }));

  res.json(result);
}));

router.post('/deposit', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = depositCreateSchema.parse(req.body);

  const { date, memberId, amount, note } = validatedData;

  const activeAccount = db.prepare('SELECT Id, CurrentBalance FROM HouseholdAccounts WHERE IsActive = 1 LIMIT 1').get() as {
    Id: string;
    CurrentBalance: number;
  } | undefined;

  if (!activeAccount) {
    throw new NotFoundError('No active household account found.');
  }

  const id = generateId('t');

  db.prepare('BEGIN TRANSACTION').run();

  try {
    db.prepare('INSERT INTO Transactions (Id, Type, Amount, Date, HouseholdAccountId, MemberId, Note) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, 'DEPOSIT', amount, date, activeAccount.Id, memberId, note);

    db.prepare('UPDATE HouseholdAccounts SET CurrentBalance = CurrentBalance + ? WHERE Id = ?').run(amount, activeAccount.Id);

    db.prepare('COMMIT').run();

    const updatedAccount = db.prepare('SELECT CurrentBalance FROM HouseholdAccounts WHERE Id = ?').get(activeAccount.Id) as { CurrentBalance: number };

    res.status(201).json({
      id,
      type: 'DEPOSIT',
      amount,
      date,
      householdAccountId: activeAccount.Id,
      memberId,
      note,
      currentBalance: updatedAccount.CurrentBalance
    });
  } catch (error) {
    db.prepare('ROLLBACK').run();
    throw error;
  }
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const transaction = db.prepare('SELECT Id, Type, Amount, HouseholdAccountId, ExpenseId FROM Transactions WHERE Id = ?').get(id) as {
    Id: string;
    Type: string;
    Amount: number;
    HouseholdAccountId: string | null;
    ExpenseId: string | null;
  } | undefined;

  if (!transaction) {
    throw new NotFoundError('Transaction not found.');
  }

  if (!transaction.HouseholdAccountId) {
    throw new NotFoundError('Household account not found for this transaction.');
  }

  db.prepare('BEGIN TRANSACTION').run();

  try {
    if (transaction.Type === 'DEPOSIT') {
      db.prepare('UPDATE HouseholdAccounts SET CurrentBalance = CurrentBalance - ? WHERE Id = ?').run(transaction.Amount, transaction.HouseholdAccountId);
    } else if (transaction.Type === 'PAYMENT') {
      db.prepare('UPDATE HouseholdAccounts SET CurrentBalance = CurrentBalance + ? WHERE Id = ?').run(transaction.Amount, transaction.HouseholdAccountId);

      if (transaction.ExpenseId) {
        db.prepare('DELETE FROM Expenses WHERE Id = ?').run(transaction.ExpenseId);
      }
    }

    db.prepare('DELETE FROM Transactions WHERE Id = ?').run(id);

    db.prepare('COMMIT').run();

    res.status(204).send();
  } catch (error) {
    db.prepare('ROLLBACK').run();
    throw error;
  }
}));

export default router;
