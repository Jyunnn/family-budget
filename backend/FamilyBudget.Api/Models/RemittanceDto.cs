namespace FamilyBudget.Api.Models;

public sealed record RemittanceDto(
    string MemberId,
    string Name,
    int PaidAdvance,
    int NextMonthDue,
    int TransferToMember);
