using FamilyBudget.Api.Data;
using FamilyBudget.Api.Models;
using FamilyBudget.Api.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace FamilyBudget.Api.Controllers;

[ApiController]
[Route("remittance")]
public sealed class RemittanceController : ControllerBase
{
    private readonly SqliteConnectionFactory _connectionFactory;

    public RemittanceController(SqliteConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RemittanceDto>>> GetRemittance([FromQuery] string? month)
    {
        if (string.IsNullOrWhiteSpace(month))
        {
            return BadRequest(new { message = "Missing month." });
        }

        if (!DateValidation.IsValidMonth(month))
        {
            return BadRequest(new { message = "Invalid month format." });
        }

        var previousMonth = DateValidation.GetPreviousMonth(month);
        var totals = new Dictionary<string, int>();
        var members = new List<(string Id, string Name, int MonthlyContribution)>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using (var totalsCommand = connection.CreateCommand())
        {
            totalsCommand.CommandText = """
                SELECT MemberId, SUM(Amount) as Total
                FROM Expenses
                WHERE Date LIKE @monthPrefix || '%'
                GROUP BY MemberId;
                """;
            totalsCommand.Parameters.AddWithValue("@monthPrefix", previousMonth);

            await using var reader = await totalsCommand.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var memberId = reader.GetString(0);
                var total = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
                totals[memberId] = total;
            }
        }

        await using (var membersCommand = connection.CreateCommand())
        {
            membersCommand.CommandText = "SELECT Id, Name, MonthlyContribution FROM Members ORDER BY CreatedAt;";
            await using var reader = await membersCommand.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                members.Add((reader.GetString(0), reader.GetString(1), reader.GetInt32(2)));
            }
        }

        var results = members.Select(member =>
        {
            var paidAdvance = totals.TryGetValue(member.Id, out var total) ? total : 0;
            var due = member.MonthlyContribution - paidAdvance;
            return new RemittanceDto(
                member.Id,
                member.Name,
                paidAdvance,
                due > 0 ? due : 0,
                due < 0 ? Math.Abs(due) : 0);
        }).ToList();

        return Ok(results);
    }
}
