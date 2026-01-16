import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'App_Data', 'family-budget.db');
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db: Database.Database = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Members (
      Id TEXT PRIMARY KEY,
      Name TEXT NOT NULL,
      MonthlyContribution INTEGER NOT NULL,
      CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Categories (
      Id TEXT PRIMARY KEY,
      Name TEXT NOT NULL,
      IsActive INTEGER NOT NULL DEFAULT 1,
      CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Expenses (
      Id TEXT PRIMARY KEY,
      Date TEXT NOT NULL,
      MemberId TEXT,
      CategoryId TEXT NOT NULL,
      Amount INTEGER NOT NULL,
      Note TEXT,
      IsFromHousehold INTEGER NOT NULL DEFAULT 0,
      HouseholdAccountId TEXT,
      CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(MemberId) REFERENCES Members(Id),
      FOREIGN KEY(CategoryId) REFERENCES Categories(Id),
      FOREIGN KEY(HouseholdAccountId) REFERENCES HouseholdAccounts(Id)
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON Expenses(Date);
    CREATE INDEX IF NOT EXISTS idx_expenses_member ON Expenses(MemberId);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON Expenses(CategoryId);
    CREATE INDEX IF NOT EXISTS idx_expenses_household ON Expenses(IsFromHousehold);

    CREATE TABLE IF NOT EXISTS HouseholdAccounts (
      Id TEXT PRIMARY KEY,
      Name TEXT NOT NULL,
      BankName TEXT,
      AccountNumber TEXT,
      InitialBalance INTEGER NOT NULL DEFAULT 0,
      CurrentBalance INTEGER NOT NULL DEFAULT 0,
      IsActive INTEGER NOT NULL DEFAULT 1,
      CreatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_household_accounts_active ON HouseholdAccounts(IsActive);

    CREATE TABLE IF NOT EXISTS Transactions (
      Id TEXT PRIMARY KEY,
      Type TEXT NOT NULL,
      Amount INTEGER NOT NULL,
      Date TEXT NOT NULL,
      HouseholdAccountId TEXT NOT NULL,
      MemberId TEXT,
      ExpenseId TEXT,
      Note TEXT,
      CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(HouseholdAccountId) REFERENCES HouseholdAccounts(Id),
      FOREIGN KEY(MemberId) REFERENCES Members(Id),
      FOREIGN KEY(ExpenseId) REFERENCES Expenses(Id)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_type ON Transactions(Type);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON Transactions(Date);
  `);

  const defaultAccountExists = db.prepare('SELECT COUNT(*) as count FROM HouseholdAccounts WHERE Id = ?').get('h_default') as { count: number };
  if (defaultAccountExists.count === 0) {
    db.prepare(`
      INSERT INTO HouseholdAccounts (Id, Name, BankName, AccountNumber, InitialBalance, CurrentBalance, IsActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('h_default', '家用帳戶', null, null, 0, 0, 1);
  }
}

initializeDatabase();

export default db;
