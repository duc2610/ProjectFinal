using ToeicGenius.Domains.DTOs.Responses.TestCreatorDashboard;

namespace ToeicGenius.Services.Interfaces;

public interface ITestCreatorDashboardService
{
    Task<TestCreatorDashboardStatisticsResponseDto> GetDashboardStatisticsAsync(Guid creatorId);
    Task<List<TestPerformanceByDayResponseDto>> GetTestPerformanceByDayAsync(Guid creatorId, int days = 7);
    Task<List<TopPerformingTestResponseDto>> GetTopPerformingTestsAsync(Guid creatorId, int limit = 5);
    Task<List<TestCreatorRecentActivityResponseDto>> GetRecentActivitiesAsync(Guid creatorId, int limit = 20);
}
