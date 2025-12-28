namespace FamilyBudget.Api.Models;

public sealed record ExpenseDto(string Id, string Date, string MemberId, string CategoryId, int Amount, string? Note);
