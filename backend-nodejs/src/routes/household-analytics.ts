import { Router, Request, Response } from 'express';
import db from '../config/database';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';

const router = Router();

router.get('/summary', asyncHandler(async (req: Request, res: Response) => {
  const { accountId } = req.query;

  let account;
  if (accountId) {
    account = db.prepare('SELECT Id, Name, CurrentBalance, InitialBalance FROM HouseholdAccounts WHERE Id = ?').get(accountId) as {
      Id: string;
      Name: string;
      CurrentBalance: number;
      InitialBalance: number;
    } | undefined;
  } else {
    account = db.prepare('SELECT Id, Name, CurrentBalance, InitialBalance FROM HouseholdAccounts WHERE IsActive = 1 LIMIT 1').get() as {
      Id: string;
      Name: string;
      CurrentBalance: number;
      InitialBalance: number;
    } | undefined;
  }

  if (!account) {
    throw new NotFoundError('Household account not found.');
  }

  const totalDeposit = db.prepare('SELECT COALESCE(SUM(Amount), 0) as total FROM Transactions WHERE HouseholdAccountId = ? AND Type = ?').get(account.Id, 'DEPOSIT') as { total: number };
  const totalPayment = db.prepare('SELECT COALESCE(SUM(Amount), 0) as total FROM Transactions WHERE HouseholdAccountId = ? AND Type = ?').get(account.Id, 'PAYMENT') as { total: number };

  const transactions = db.prepare(`
    SELECT Type, Amount, Date
    FROM Transactions
    WHERE HouseholdAccountId = ?
    ORDER BY Date DESC, CreatedAt DESC
    LIMIT 10
  `).all(account.Id) as Array<{
    Type: string;
    Amount: number;
    Date: string;
  }>;

  res.json({
    account: {
      id: account.Id,
      name: account.Name,
      initialBalance: account.InitialBalance,
      currentBalance: account.CurrentBalance
    },
    totalDeposit: totalDeposit.total,
    totalPayment: totalPayment.total,
    recentTransactions: transactions.map(t => ({
      type: t.Type,
      amount: t.Amount,
      date: t.Date
    }))
  });
}));

export default router;
