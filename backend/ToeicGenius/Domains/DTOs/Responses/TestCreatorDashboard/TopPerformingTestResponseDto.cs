using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.TestCreatorDashboard;

public class TopPerformingTestResponseDto
{
    public int TestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public TestVisibilityStatus VisibilityStatus { get; set; }
    public string VisibilityStatusText { get; set; } = string.Empty; // "published" hoặc "hidden"
    public int CompletedCount { get; set; }
    public decimal AverageScore { get; set; }
    public decimal AveragePercentage { get; set; }
    public int Rank { get; set; }
}
