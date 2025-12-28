using Microsoft.Data.Sqlite;

namespace FamilyBudget.Api.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(SqliteConnectionFactory connectionFactory)
    {
        await using var connection = connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
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
            """;

        await command.ExecuteNonQueryAsync();
    }
}
