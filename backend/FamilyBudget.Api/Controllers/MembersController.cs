using FamilyBudget.Api.Data;
using FamilyBudget.Api.Models;
using FamilyBudget.Api.Models.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace FamilyBudget.Api.Controllers;

[ApiController]
[Route("members")]
public sealed class MembersController : ControllerBase
{
    private readonly SqliteConnectionFactory _connectionFactory;

    public MembersController(SqliteConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetMembers()
    {
        var results = new List<MemberDto>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Name, MonthlyContribution FROM Members ORDER BY CreatedAt;";

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new MemberDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetInt32(2)));
        }

        return Ok(results);
    }

    [HttpPost]
    public async Task<ActionResult<MemberDto>> CreateMember([FromBody] MemberCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.MonthlyContribution <= 0)
        {
            return BadRequest(new { message = "Invalid member payload." });
        }

        var member = new MemberDto(
            $"m_{Guid.NewGuid():N}",
            request.Name.Trim(),
            request.MonthlyContribution);

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO Members (Id, Name, MonthlyContribution)
            VALUES (@id, @name, @amount);
            """;
        command.Parameters.AddWithValue("@id", member.Id);
        command.Parameters.AddWithValue("@name", member.Name);
        command.Parameters.AddWithValue("@amount", member.MonthlyContribution);

        await command.ExecuteNonQueryAsync();

        return Created($"/members/{member.Id}", member);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMember(string id, [FromBody] MemberUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.MonthlyContribution <= 0)
        {
            return BadRequest(new { message = "Invalid member payload." });
        }

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE Members
            SET Name = @name,
                MonthlyContribution = @amount
            WHERE Id = @id;
            """;
        command.Parameters.AddWithValue("@id", id);
        command.Parameters.AddWithValue("@name", request.Name.Trim());
        command.Parameters.AddWithValue("@amount", request.MonthlyContribution);

        var rows = await command.ExecuteNonQueryAsync();
        if (rows == 0)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMember(string id)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var checkCommand = connection.CreateCommand();
        checkCommand.CommandText = "SELECT COUNT(1) FROM Expenses WHERE MemberId = @id;";
        checkCommand.Parameters.AddWithValue("@id", id);
        var usage = (long?)await checkCommand.ExecuteScalarAsync() ?? 0;
        if (usage > 0)
        {
            return Conflict(new { message = "Member has expenses and cannot be removed." });
        }

        await using var deleteCommand = connection.CreateCommand();
        deleteCommand.CommandText = "DELETE FROM Members WHERE Id = @id;";
        deleteCommand.Parameters.AddWithValue("@id", id);
        var rows = await deleteCommand.ExecuteNonQueryAsync();
        if (rows == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
}
