namespace ToeicGenius.Domains.DTOs.Responses.TestCreatorDashboard;

public class TestPerformanceByDayResponseDto
{
    public string Date { get; set; } = string.Empty; // Format: "DD/MM"
    public int CompletedCount { get; set; }
    public decimal AverageScore { get; set; }
    public decimal AveragePercentage { get; set; } // Điểm TB dạng %
}
