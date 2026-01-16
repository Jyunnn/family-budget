import { Router, Request, Response } from 'express';
import db from '../config/database';
import { generateId } from '../utils/dateUtils';
import { memberCreateSchema, memberUpdateSchema } from '../validators/validators';
import { asyncHandler, NotFoundError, ConflictError } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const members = db.prepare('SELECT Id, Name, MonthlyContribution FROM Members ORDER BY CreatedAt').all() as Array<{
    Id: string;
    Name: string;
    MonthlyContribution: number;
  }>;

  const result = members.map(m => ({
    id: m.Id,
    name: m.Name,
    monthlyContribution: m.MonthlyContribution
  }));

  res.json(result);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = memberCreateSchema.parse(req.body);

  const id = generateId('m');
  const { name, monthlyContribution } = validatedData;

  db.prepare('INSERT INTO Members (Id, Name, MonthlyContribution) VALUES (?, ?, ?)').run(id, name, monthlyContribution);

  res.status(201).json({
    id,
    name,
    monthlyContribution
  });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = memberUpdateSchema.parse(req.body);

  const { name, monthlyContribution } = validatedData;

  const stmt = db.prepare('UPDATE Members SET Name = ?, MonthlyContribution = ? WHERE Id = ?');
  const result = stmt.run(name, monthlyContribution, id);

  if (result.changes === 0) {
    throw new NotFoundError('Member not found.');
  }

  res.status(204).send();
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const usageCheck = db.prepare('SELECT COUNT(1) as count FROM Expenses WHERE MemberId = ?').get(id) as { count: number };
  if (usageCheck.count > 0) {
    throw new ConflictError('Member has expenses and cannot be removed.');
  }

  const stmt = db.prepare('DELETE FROM Members WHERE Id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    throw new NotFoundError('Member not found.');
  }

  res.status(204).send();
}));

export default router;
