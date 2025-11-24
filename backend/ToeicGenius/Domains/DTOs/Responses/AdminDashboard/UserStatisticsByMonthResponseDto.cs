namespace ToeicGenius.Domains.DTOs.Responses.AdminDashboard;

public class UserStatisticsByMonthResponseDto
{
    public string Month { get; set; } = string.Empty; // Format: "MM/YYYY"
    public int UserCount { get; set; }
}
