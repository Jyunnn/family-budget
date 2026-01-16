#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'App_Data', 'family-budget.db');
const db = new Database(dbPath);

console.log('Starting database migration for household account fields...');

try {
  const pragma = db.pragma('table_info(Expenses)');
  const hasIsFromHousehold = pragma.some(col => col.name === 'IsFromHousehold');
  const hasHouseholdAccountId = pragma.some(col => col.name === 'HouseholdAccountId');

  if (!hasIsFromHousehold) {
    db.exec("ALTER TABLE Expenses ADD COLUMN IsFromHousehold INTEGER NOT NULL DEFAULT 0");
    console.log('✓ Added IsFromHousehold column');
  } else {
    console.log('✓ IsFromHousehold column already exists');
  }

  if (!hasHouseholdAccountId) {
    db.exec("ALTER TABLE Expenses ADD COLUMN HouseholdAccountId TEXT");
    console.log('✓ Added HouseholdAccountId column');
  } else {
    console.log('✓ HouseholdAccountId column already exists');
  }

  console.log('Migration completed successfully!');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}

db.close();
