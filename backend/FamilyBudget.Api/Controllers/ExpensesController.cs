using FamilyBudget.Api.Data;
using FamilyBudget.Api.Models;
using FamilyBudget.Api.Models.Requests;
using FamilyBudget.Api.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace FamilyBudget.Api.Controllers;

[ApiController]
[Route("expenses")]
public sealed class ExpensesController : ControllerBase
{
    private readonly SqliteConnectionFactory _connectionFactory;

    public ExpensesController(SqliteConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses([FromQuery] string? from, [FromQuery] string? to)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
        {
            return BadRequest(new { message = "Missing date range." });
        }

        if (!DateValidation.IsValidDate(from) || !DateValidation.IsValidDate(to))
        {
            return BadRequest(new { message = "Invalid date format." });
        }

        var results = new List<ExpenseDto>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT Id, Date, MemberId, CategoryId, Amount, Note
            FROM Expenses
            WHERE Date >= @from AND Date <= @to
            ORDER BY Date DESC, CreatedAt DESC;
            """;
        command.Parameters.AddWithValue("@from", from);
        command.Parameters.AddWithValue("@to", to);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new ExpenseDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetInt32(4),
                reader.IsDBNull(5) ? null : reader.GetString(5)));
        }

        return Ok(results);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] ExpenseCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Date) || !DateValidation.IsValidDate(request.Date))
        {
            return BadRequest(new { message = "Invalid expense date." });
        }

        if (string.IsNullOrWhiteSpace(request.MemberId) || string.IsNullOrWhiteSpace(request.CategoryId))
        {
            return BadRequest(new { message = "Invalid member or category." });
        }

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Amount must be greater than zero." });
        }

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        if (!await ExistsAsync(connection, "Members", request.MemberId))
        {
            return BadRequest(new { message = "Member not found." });
        }

        if (!await ExistsAsync(connection, "Categories", request.CategoryId))
        {
            return BadRequest(new { message = "Category not found." });
        }

        var expense = new ExpenseDto(
            $"e_{Guid.NewGuid():N}",
            request.Date,
            request.MemberId,
            request.CategoryId,
            request.Amount,
            string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim());

        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO Expenses (Id, Date, MemberId, CategoryId, Amount, Note)
            VALUES (@id, @date, @memberId, @categoryId, @amount, @note);
            """;
        command.Parameters.AddWithValue("@id", expense.Id);
        command.Parameters.AddWithValue("@date", expense.Date);
        command.Parameters.AddWithValue("@memberId", expense.MemberId);
        command.Parameters.AddWithValue("@categoryId", expense.CategoryId);
        command.Parameters.AddWithValue("@amount", expense.Amount);
        command.Parameters.AddWithValue("@note", (object?)expense.Note ?? DBNull.Value);

        await command.ExecuteNonQueryAsync();

        return Created($"/expenses/{expense.Id}", expense);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(string id, [FromBody] ExpenseUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Date) || !DateValidation.IsValidDate(request.Date))
        {
            return BadRequest(new { message = "Invalid expense date." });
        }

        if (string.IsNullOrWhiteSpace(request.MemberId) || string.IsNullOrWhiteSpace(request.CategoryId))
        {
            return BadRequest(new { message = "Invalid member or category." });
        }

        if (request.Amount <= 0)
        {
            return BadRequest(new { message = "Amount must be greater than zero." });
        }

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        if (!await ExistsAsync(connection, "Members", request.MemberId))
        {
            return BadRequest(new { message = "Member not found." });
        }

        if (!await ExistsAsync(connection, "Categories", request.CategoryId))
        {
            return BadRequest(new { message = "Category not found." });
        }

        var expense = new ExpenseDto(
            id,
            request.Date,
            request.MemberId,
            request.CategoryId,
            request.Amount,
            string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim());

        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE Expenses
            SET Date = @date,
                MemberId = @memberId,
                CategoryId = @categoryId,
                Amount = @amount,
                Note = @note
            WHERE Id = @id;
            """;
        command.Parameters.AddWithValue("@id", expense.Id);
        command.Parameters.AddWithValue("@date", expense.Date);
        command.Parameters.AddWithValue("@memberId", expense.MemberId);
        command.Parameters.AddWithValue("@categoryId", expense.CategoryId);
        command.Parameters.AddWithValue("@amount", expense.Amount);
        command.Parameters.AddWithValue("@note", (object?)expense.Note ?? DBNull.Value);

        var rows = await command.ExecuteNonQueryAsync();
        if (rows == 0)
        {
            return NotFound();
        }

        return Ok(expense);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(string id)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = "DELETE FROM Expenses WHERE Id = @id;";
        command.Parameters.AddWithValue("@id", id);

        var rows = await command.ExecuteNonQueryAsync();
        if (rows == 0)
        {
            return NotFound();
        }

        return NoContent();
    }

    private static async Task<bool> ExistsAsync(SqliteConnection connection, string table, string id)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = $"SELECT COUNT(1) FROM {table} WHERE Id = @id;";
        command.Parameters.AddWithValue("@id", id);
        var count = (long?)await command.ExecuteScalarAsync() ?? 0;
        return count > 0;
    }
}
