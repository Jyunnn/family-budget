namespace FamilyBudget.Api.Models.Requests;

public sealed record ExpenseUpdateRequest(
    string Date,
    string MemberId,
    string CategoryId,
    int Amount,
    string? Note);
