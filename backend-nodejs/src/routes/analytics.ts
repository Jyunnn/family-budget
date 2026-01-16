import { Router, Request, Response } from 'express';
import db from '../config/database';
import { isValidDate } from '../utils/dateUtils';
import { asyncHandler, ValidationError } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query;

  if (!from || !to) {
    throw new ValidationError('Missing date range.');
  }

  if (!isValidDate(from as string) || !isValidDate(to as string)) {
    throw new ValidationError('Invalid date format.');
  }

  const analytics = db.prepare(`
    SELECT c.Id as CategoryId, c.Name, SUM(e.Amount) as Total
    FROM Expenses e
    JOIN Categories c ON c.Id = e.CategoryId
    WHERE e.Date >= ? AND e.Date <= ?
    GROUP BY c.Id, c.Name
    ORDER BY Total DESC
  `).all(from, to) as Array<{
    CategoryId: string;
    Name: string;
    Total: number | null;
  }>;

  const result = analytics.map(a => ({
    categoryId: a.CategoryId,
    name: a.Name,
    amount: a.Total ?? 0
  }));

  res.json(result);
}));

export default router;
