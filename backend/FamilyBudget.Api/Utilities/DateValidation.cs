using System.Globalization;

namespace FamilyBudget.Api.Utilities;

public static class DateValidation
{
    private static readonly CultureInfo Culture = CultureInfo.InvariantCulture;

    public static bool IsValidDate(string value)
    {
        return DateOnly.TryParseExact(value, "yyyy-MM-dd", Culture, DateTimeStyles.None, out _);
    }

    public static bool IsValidMonth(string value)
    {
        return DateOnly.TryParseExact($"{value}-01", "yyyy-MM-dd", Culture, DateTimeStyles.None, out _);
    }

    public static string GetPreviousMonth(string monthValue)
    {
        var date = DateOnly.ParseExact($"{monthValue}-01", "yyyy-MM-dd", Culture, DateTimeStyles.None);
        return date.AddMonths(-1).ToString("yyyy-MM", Culture);
    }
}
