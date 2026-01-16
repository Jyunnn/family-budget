#!/usr/bin/env node
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const ASPNET_DB_PATH = path.join(process.cwd(), '..', 'backend', 'FamilyBudget.Api', 'App_Data', 'family-budget.db');
const NODE_DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'App_Data', 'family-budget.db');

function migrateDatabase() {
  console.log('Starting database migration...');

  if (!fs.existsSync(ASPNET_DB_PATH)) {
    console.error(`ASP.NET database not found at: ${ASPNET_DB_PATH}`);
    process.exit(1);
  }

  const aspnetDb = new Database(ASPNET_DB_PATH, { readonly: true });

  try {
    console.log(`Source: ${ASPNET_DB_PATH}`);
    console.log(`Target: ${NODE_DB_PATH}`);

    const members = aspnetDb.prepare('SELECT * FROM Members').all();
    const categories = aspnetDb.prepare('SELECT * FROM Categories').all();
    const expenses = aspnetDb.prepare('SELECT * FROM Expenses').all();

    console.log(`Found ${members.length} members, ${categories.length} categories, ${expenses.length} expenses`);

    const nodeDb = new Database(NODE_DB_PATH);
    nodeDb.pragma('foreign_keys = OFF');

    nodeDb.exec(`
      PRAGMA foreign_keys = OFF;

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

    nodeDb.exec('BEGIN TRANSACTION');

    try {
      const insertMember = nodeDb.prepare('INSERT OR REPLACE INTO Members (Id, Name, MonthlyContribution, CreatedAt) VALUES (?, ?, ?, ?)');
      const insertCategory = nodeDb.prepare('INSERT OR REPLACE INTO Categories (Id, Name, IsActive, CreatedAt) VALUES (?, ?, ?, ?)');
      const insertExpense = nodeDb.prepare('INSERT OR REPLACE INTO Expenses (Id, Date, MemberId, CategoryId, Amount, Note, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');

      const insertMembers = nodeDb.transaction((members) => {
        for (const member of members) {
          insertMember.run(member.Id, member.Name, member.MonthlyContribution, member.CreatedAt);
        }
      });

      const insertCategories = nodeDb.transaction((categories) => {
        for (const category of categories) {
          insertCategory.run(category.Id, category.Name, category.IsActive, category.CreatedAt);
        }
      });

      const insertExpenses = nodeDb.transaction((expenses) => {
        for (const expense of expenses) {
          insertExpense.run(expense.Id, expense.Date, expense.MemberId, expense.CategoryId, expense.Amount, expense.Note, expense.CreatedAt);
        }
      });

      insertMembers(members);
      insertCategories(categories);
      insertExpenses(expenses);

      nodeDb.exec('COMMIT');

      console.log('Migration completed successfully!');
      console.log('Data transferred:');
      console.log(`  - ${members.length} members`);
      console.log(`  - ${categories.length} categories`);
      console.log(`  - ${expenses.length} expenses`);

    } catch (error) {
      nodeDb.exec('ROLLBACK');
      throw error;
    } finally {
      nodeDb.pragma('foreign_keys = ON');
      nodeDb.close();
    }

    aspnetDb.close();

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDatabase();
