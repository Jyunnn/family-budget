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
      MemberId TEXT NOT NULL,
      CategoryId TEXT NOT NULL,
      Amount INTEGER NOT NULL,
      Note TEXT,
      CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(MemberId) REFERENCES Members(Id),
      FOREIGN KEY(CategoryId) REFERENCES Categories(Id)
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON Expenses(Date);
    CREATE INDEX IF NOT EXISTS idx_expenses_member ON Expenses(MemberId);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON Expenses(CategoryId);
  `);
}

initializeDatabase();

export default db;
