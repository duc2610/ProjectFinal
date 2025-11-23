namespace ToeicGenius.Domains.DTOs.Responses.AdminDashboard;

public class TestCompletionsByDayResponseDto
{
    public string Date { get; set; } = string.Empty; // Format: "DD/MM"
    public int CompletedTestsCount { get; set; }
}
