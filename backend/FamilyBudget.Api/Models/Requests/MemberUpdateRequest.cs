namespace FamilyBudget.Api.Models.Requests;

public sealed record MemberUpdateRequest(string Name, int MonthlyContribution);
