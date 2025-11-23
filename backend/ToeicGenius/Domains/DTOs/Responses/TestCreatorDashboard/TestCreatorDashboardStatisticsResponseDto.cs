namespace ToeicGenius.Domains.DTOs.Responses.TestCreatorDashboard;

public class TestCreatorDashboardStatisticsResponseDto
{
    public int TotalTests { get; set; }
    public int PublishedTests { get; set; }
    public int DraftTests { get; set; }
    public int TotalQuestions { get; set; }
    public int TotalTestResults { get; set; }
    public decimal AverageScore { get; set; }
    public decimal PublishedPercentage { get; set; }

    // So sánh với kỳ trước
    public int NewTestsComparedToPrevious { get; set; }
    public int NewQuestionsComparedToPrevious { get; set; }
}
