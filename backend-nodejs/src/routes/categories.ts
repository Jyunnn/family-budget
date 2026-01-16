import { Router, Request, Response } from 'express';
import db from '../config/database';
import { generateId } from '../utils/dateUtils';
import { categoryCreateSchema, categoryUpdateSchema } from '../validators/validators';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const categories = db.prepare('SELECT Id, Name, IsActive FROM Categories ORDER BY CreatedAt').all() as Array<{
    Id: string;
    Name: string;
    IsActive: number;
  }>;

  const result = categories.map(c => ({
    id: c.Id,
    name: c.Name,
    isActive: c.IsActive === 1
  }));

  res.json(result);
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = categoryCreateSchema.parse(req.body);

  const id = generateId('c');
  const { name } = validatedData;

  db.prepare('INSERT INTO Categories (Id, Name, IsActive) VALUES (?, ?, 1)').run(id, name);

  res.status(201).json({
    id,
    name,
    isActive: true
  });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = categoryUpdateSchema.parse(req.body);

  const { name, isActive } = validatedData;

  const updates: string[] = [];
  const params: any[] = [];

  if (name !== undefined) {
    updates.push('Name = ?');
    params.push(name);
  }

  if (isActive !== undefined) {
    updates.push('IsActive = ?');
    params.push(isActive ? 1 : 0);
  }

  if (updates.length === 0) {
    throw new ValidationError('Invalid category payload.');
  }

  params.push(id);
  const updateQuery = `UPDATE Categories SET ${updates.join(', ')} WHERE Id = ?`;

  const stmt = db.prepare(updateQuery);
  const result = stmt.run(...params);

  if (result.changes === 0) {
    throw new NotFoundError('Category not found.');
  }

  const category = db.prepare('SELECT Id, Name, IsActive FROM Categories WHERE Id = ?').get(id) as {
    Id: string;
    Name: string;
    IsActive: number;
  };

  res.json({
    id: category.Id,
    name: category.Name,
    isActive: category.IsActive === 1
  });
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existsCheck = db.prepare('SELECT COUNT(1) as count FROM Categories WHERE Id = ?').get(id) as { count: number };
  if (existsCheck.count === 0) {
    throw new NotFoundError('Category not found.');
  }

  const usageCheck = db.prepare('SELECT COUNT(1) as count FROM Expenses WHERE CategoryId = ?').get(id) as { count: number };
  if (usageCheck.count > 0) {
    db.prepare('UPDATE Categories SET IsActive = 0 WHERE Id = ?').run(id);
    res.json({
      removed: false,
      reason: 'in-use'
    });
    return;
  }

  const stmt = db.prepare('DELETE FROM Categories WHERE Id = ?');
  stmt.run(id);

  res.json({
    removed: true
  });
}));

export default router;
