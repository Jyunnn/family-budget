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
    SELECT Id, Date, MemberId, CategoryId, Amount, Note
    FROM Expenses
    WHERE Date >= ? AND Date <= ?
    ORDER BY Date DESC, CreatedAt DESC
  `).all(from, to) as Array<{
    Id: string;
    Date: string;
    MemberId: string;
    CategoryId: string;
    Amount: number;
    Note: string | null;
  }>;

  const result = expenses.map(e => ({
    id: e.Id,
    date: e.Date,
    memberId: e.MemberId,
    categoryId: e.CategoryId,
    amount: e.Amount,
    note: e.Note
  }));

  res.json(result);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = expenseCreateSchema.parse(req.body);

  const { date, memberId, categoryId, amount, note } = validatedData;

  if (!isValidDate(date)) {
    throw new ValidationError('Invalid expense date.');
  }

  const memberCheck = db.prepare('SELECT COUNT(1) as count FROM Members WHERE Id = ?').get(memberId) as { count: number };
  if (memberCheck.count === 0) {
    throw new ValidationError('Member not found.');
  }

  const categoryCheck = db.prepare('SELECT COUNT(1) as count FROM Categories WHERE Id = ?').get(categoryId) as { count: number };
  if (categoryCheck.count === 0) {
    throw new ValidationError('Category not found.');
  }

  const id = generateId('e');

  db.prepare('INSERT INTO Expenses (Id, Date, MemberId, CategoryId, Amount, Note) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, date, memberId, categoryId, amount, note);

  res.status(201).json({
    id,
    date,
    memberId,
    categoryId,
    amount,
    note
  });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = expenseUpdateSchema.parse(req.body);

  const { date, memberId, categoryId, amount, note } = validatedData;

  if (!isValidDate(date)) {
    throw new ValidationError('Invalid expense date.');
  }

  const memberCheck = db.prepare('SELECT COUNT(1) as count FROM Members WHERE Id = ?').get(memberId) as { count: number };
  if (memberCheck.count === 0) {
    throw new ValidationError('Member not found.');
  }

  const categoryCheck = db.prepare('SELECT COUNT(1) as count FROM Categories WHERE Id = ?').get(categoryId) as { count: number };
  if (categoryCheck.count === 0) {
    throw new ValidationError('Category not found.');
  }

  const stmt = db.prepare(`
    UPDATE Expenses
    SET Date = ?, MemberId = ?, CategoryId = ?, Amount = ?, Note = ?
    WHERE Id = ?
  `);
  const result = stmt.run(date, memberId, categoryId, amount, note, id);

  if (result.changes === 0) {
    throw new NotFoundError('Expense not found.');
  }

  res.json({
    id,
    date,
    memberId,
    categoryId,
    amount,
    note
  });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM Expenses WHERE Id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    throw new NotFoundError('Expense not found.');
  }

  res.status(204).send();
}));

export default router;
