using Microsoft.Data.Sqlite;

namespace FamilyBudget.Api.Data;

public sealed class SqliteConnectionFactory
{
    public SqliteConnectionFactory(string connectionString)
    {
        ConnectionString = connectionString;
    }

    public string ConnectionString { get; }

    public SqliteConnection CreateConnection()
    {
        return new SqliteConnection(ConnectionString);
    }
}
