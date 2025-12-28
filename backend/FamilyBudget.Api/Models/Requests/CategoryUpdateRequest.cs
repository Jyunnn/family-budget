namespace FamilyBudget.Api.Models.Requests;

public sealed record CategoryUpdateRequest(string? Name, bool? IsActive);
