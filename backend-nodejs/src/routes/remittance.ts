import { Router, Request, Response } from 'express';
import db from '../config/database';
import { isValidMonth, getPreviousMonth } from '../utils/dateUtils';
import { asyncHandler, ValidationError } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { month } = req.query;

  if (!month) {
    throw new ValidationError('Missing month.');
  }

  if (!isValidMonth(month as string)) {
    throw new ValidationError('Invalid month format.');
  }

  const previousMonth = getPreviousMonth(month as string);
  const monthPrefix = `${previousMonth}%`;

  const totals = new Map<string, number>();
  const totalsResult = db.prepare(`
    SELECT MemberId, SUM(Amount) as Total
    FROM Expenses
    WHERE Date LIKE ?
    GROUP BY MemberId
  `).all(monthPrefix) as Array<{ MemberId: string; Total: number | null }>;

  totalsResult.forEach(t => {
    totals.set(t.MemberId, t.Total ?? 0);
  });

  const members = db.prepare('SELECT Id, Name, MonthlyContribution FROM Members ORDER BY CreatedAt').all() as Array<{
    Id: string;
    Name: string;
    MonthlyContribution: number;
  }>;

  const result = members.map(m => {
    const paidAdvance = totals.get(m.Id) ?? 0;
    const due = m.MonthlyContribution - paidAdvance;
    const nextMonthDue = due > 0 ? due : 0;
    const transferToMember = due < 0 ? Math.abs(due) : 0;

    return {
      memberId: m.Id,
      name: m.Name,
      paidAdvance,
      nextMonthDue,
      transferToMember
    };
  });

  res.json(result);
}));

export default router;
