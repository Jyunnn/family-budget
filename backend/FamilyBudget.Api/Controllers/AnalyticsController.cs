using FamilyBudget.Api.Data;
using FamilyBudget.Api.Models;
using FamilyBudget.Api.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace FamilyBudget.Api.Controllers;

[ApiController]
[Route("analytics")]
public sealed class AnalyticsController : ControllerBase
{
    private readonly SqliteConnectionFactory _connectionFactory;

    public AnalyticsController(SqliteConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategorySummaryDto>>> GetAnalytics([FromQuery] string? from, [FromQuery] string? to)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
        {
            return BadRequest(new { message = "Missing date range." });
        }

        if (!DateValidation.IsValidDate(from) || !DateValidation.IsValidDate(to))
        {
            return BadRequest(new { message = "Invalid date format." });
        }

        var results = new List<CategorySummaryDto>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT c.Id, c.Name, SUM(e.Amount) as Total
            FROM Expenses e
            JOIN Categories c ON c.Id = e.CategoryId
            WHERE e.Date >= @from AND e.Date <= @to
            GROUP BY c.Id, c.Name
            ORDER BY Total DESC;
            """;
        command.Parameters.AddWithValue("@from", from);
        command.Parameters.AddWithValue("@to", to);

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new CategorySummaryDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.IsDBNull(2) ? 0 : reader.GetInt32(2)));
        }

        return Ok(results);
    }
}
