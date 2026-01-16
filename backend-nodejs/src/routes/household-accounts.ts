import { Router, Request, Response } from 'express';
import db from '../config/database';
import { generateId } from '../utils/dateUtils';
import { householdAccountCreateSchema, householdAccountUpdateSchema } from '../validators/validators';
import { asyncHandler, NotFoundError, ConflictError } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const accounts = db.prepare('SELECT Id, Name, BankName, AccountNumber, InitialBalance, CurrentBalance, IsActive FROM HouseholdAccounts ORDER BY CreatedAt').all() as Array<{
    Id: string;
    Name: string;
    BankName: string | null;
    AccountNumber: string | null;
    InitialBalance: number;
    CurrentBalance: number;
    IsActive: number;
  }>;

  const result = accounts.map(a => ({
    id: a.Id,
    name: a.Name,
    bankName: a.BankName,
    accountNumber: a.AccountNumber,
    initialBalance: a.InitialBalance,
    currentBalance: a.CurrentBalance,
    isActive: a.IsActive === 1
  }));

  res.json(result);
}));

router.get('/active', asyncHandler(async (_req: Request, res: Response) => {
  const account = db.prepare('SELECT Id, Name, BankName, AccountNumber, InitialBalance, CurrentBalance FROM HouseholdAccounts WHERE IsActive = 1 LIMIT 1').get() as {
    Id: string;
    Name: string;
    BankName: string | null;
    AccountNumber: string | null;
    InitialBalance: number;
    CurrentBalance: number;
  } | undefined;

  if (!account) {
    throw new NotFoundError('No active household account found.');
  }

  res.json({
    id: account.Id,
    name: account.Name,
    bankName: account.BankName,
    accountNumber: account.AccountNumber,
    initialBalance: account.InitialBalance,
    currentBalance: account.CurrentBalance
  });
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = db.prepare('SELECT Id, Name, BankName, AccountNumber, InitialBalance, CurrentBalance, IsActive FROM HouseholdAccounts WHERE Id = ?').get(id) as {
    Id: string;
    Name: string;
    BankName: string | null;
    AccountNumber: string | null;
    InitialBalance: number;
    CurrentBalance: number;
    IsActive: number;
  } | undefined;

  if (!account) {
    throw new NotFoundError('Account not found.');
  }

  res.json({
    id: account.Id,
    name: account.Name,
    bankName: account.BankName,
    accountNumber: account.AccountNumber,
    initialBalance: account.InitialBalance,
    currentBalance: account.CurrentBalance,
    isActive: account.IsActive === 1
  });
}));

router.get('/:id/balance', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const account = db.prepare('SELECT CurrentBalance FROM HouseholdAccounts WHERE Id = ?').get(id) as { CurrentBalance: number } | undefined;

  if (!account) {
    throw new NotFoundError('Account not found.');
  }

  res.json({ balance: account.CurrentBalance });
}));

router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = householdAccountCreateSchema.parse(req.body);

  const id = generateId('h');
  const { name, bankName, accountNumber, initialBalance = 0 } = validatedData;

  db.prepare('INSERT INTO HouseholdAccounts (Id, Name, BankName, AccountNumber, InitialBalance, CurrentBalance, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, name, bankName, accountNumber, initialBalance, initialBalance, 1);

  res.status(201).json({
    id,
    name,
    bankName,
    accountNumber,
    initialBalance,
    currentBalance: initialBalance
  });
}));

router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = householdAccountUpdateSchema.parse(req.body);

  const { name, bankName, accountNumber, isActive } = validatedData;

  const updates: any[] = [];
  const values: any[] = [];

  if (name !== undefined) {
    updates.push('Name = ?');
    values.push(name);
  }
  if (bankName !== undefined) {
    updates.push('BankName = ?');
    values.push(bankName);
  }
  if (accountNumber !== undefined) {
    updates.push('AccountNumber = ?');
    values.push(accountNumber);
  }
  if (isActive !== undefined) {
    updates.push('IsActive = ?');
    values.push(isActive ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(204).send();
  }

  values.push(id);

  const stmt = db.prepare(`UPDATE HouseholdAccounts SET ${updates.join(', ')} WHERE Id = ?`);
  const result = stmt.run(...values);

  if (result.changes === 0) {
    throw new NotFoundError('Account not found.');
  }

  return res.status(204).send();
}));

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const usageCheck = db.prepare('SELECT COUNT(1) as count FROM Transactions WHERE HouseholdAccountId = ?').get(id) as { count: number };
  if (usageCheck.count > 0) {
    throw new ConflictError('Account has transactions and cannot be removed.');
  }

  const stmt = db.prepare('DELETE FROM HouseholdAccounts WHERE Id = ?');
  const result = stmt.run(id);

  if (result.changes === 0) {
    throw new NotFoundError('Account not found.');
  }

  res.status(204).send();
}));

export default router;
