namespace FamilyBudget.Api.Models.Requests;

public sealed record ExpenseCreateRequest(
    string Date,
    string MemberId,
    string CategoryId,
    int Amount,
    string? Note);
