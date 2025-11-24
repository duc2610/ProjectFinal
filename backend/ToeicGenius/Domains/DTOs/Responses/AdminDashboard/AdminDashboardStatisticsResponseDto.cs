namespace ToeicGenius.Domains.DTOs.Responses.AdminDashboard;

public class AdminDashboardStatisticsResponseDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalTests { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalTestResults { get; set; }
    public int BannedUsers { get; set; }

    // Thống kê so sánh với kỳ trước
    public int NewUsersComparedToPrevious { get; set; }
    public int NewTestsComparedToPrevious { get; set; }
}
