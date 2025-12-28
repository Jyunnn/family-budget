namespace FamilyBudget.Api.Models.Requests;

public sealed record MemberCreateRequest(string Name, int MonthlyContribution);
