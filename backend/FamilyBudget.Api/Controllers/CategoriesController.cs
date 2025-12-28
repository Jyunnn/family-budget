using FamilyBudget.Api.Data;
using FamilyBudget.Api.Models;
using FamilyBudget.Api.Models.Requests;
using Microsoft.AspNetCore.Mvc;

namespace FamilyBudget.Api.Controllers;

[ApiController]
[Route("categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly SqliteConnectionFactory _connectionFactory;

    public CategoriesController(SqliteConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var results = new List<CategoryDto>();

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT Id, Name, IsActive FROM Categories ORDER BY CreatedAt;";

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new CategoryDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetInt32(2) == 1));
        }

        return Ok(results);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Invalid category payload." });
        }

        var category = new CategoryDto(
            $"c_{Guid.NewGuid():N}",
            request.Name.Trim(),
            true);

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO Categories (Id, Name, IsActive)
            VALUES (@id, @name, 1);
            """;
        command.Parameters.AddWithValue("@id", category.Id);
        command.Parameters.AddWithValue("@name", category.Name);

        await command.ExecuteNonQueryAsync();

        return Created($"/categories/{category.Id}", category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(string id, [FromBody] CategoryUpdateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) && request.IsActive is null)
        {
            return BadRequest(new { message = "Invalid category payload." });
        }

        var setClauses = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            setClauses.Add("Name = @name");
        }

        if (request.IsActive is not null)
        {
            setClauses.Add("IsActive = @isActive");
        }

        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var updateCommand = connection.CreateCommand();
        updateCommand.CommandText = $"""
            UPDATE Categories
            SET {string.Join(", ", setClauses)}
            WHERE Id = @id;
            """;
        updateCommand.Parameters.AddWithValue("@id", id);
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            updateCommand.Parameters.AddWithValue("@name", request.Name!.Trim());
        }
        if (request.IsActive is not null)
        {
            updateCommand.Parameters.AddWithValue("@isActive", request.IsActive.Value ? 1 : 0);
        }

        var rows = await updateCommand.ExecuteNonQueryAsync();
        if (rows == 0)
        {
            return NotFound();
        }

        await using var fetchCommand = connection.CreateCommand();
        fetchCommand.CommandText = "SELECT Id, Name, IsActive FROM Categories WHERE Id = @id;";
        fetchCommand.Parameters.AddWithValue("@id", id);
        await using var reader = await fetchCommand.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return NotFound();
        }

        var category = new CategoryDto(
            reader.GetString(0),
            reader.GetString(1),
            reader.GetInt32(2) == 1);

        return Ok(category);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<RemoveResultDto>> DeleteCategory(string id)
    {
        await using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        await using var existsCommand = connection.CreateCommand();
        existsCommand.CommandText = "SELECT COUNT(1) FROM Categories WHERE Id = @id;";
        existsCommand.Parameters.AddWithValue("@id", id);
        var exists = (long?)await existsCommand.ExecuteScalarAsync() ?? 0;
        if (exists == 0)
        {
            return NotFound();
        }

        await using var usageCommand = connection.CreateCommand();
        usageCommand.CommandText = "SELECT COUNT(1) FROM Expenses WHERE CategoryId = @id;";
        usageCommand.Parameters.AddWithValue("@id", id);
        var usage = (long?)await usageCommand.ExecuteScalarAsync() ?? 0;
        if (usage > 0)
        {
            await using var disableCommand = connection.CreateCommand();
            disableCommand.CommandText = "UPDATE Categories SET IsActive = 0 WHERE Id = @id;";
            disableCommand.Parameters.AddWithValue("@id", id);
            await disableCommand.ExecuteNonQueryAsync();

            return Ok(new RemoveResultDto(false, "in-use"));
        }

        await using var deleteCommand = connection.CreateCommand();
        deleteCommand.CommandText = "DELETE FROM Categories WHERE Id = @id;";
        deleteCommand.Parameters.AddWithValue("@id", id);
        await deleteCommand.ExecuteNonQueryAsync();

        return Ok(new RemoveResultDto(true, null));
    }
}
