using ToeicGenius.Domains.DTOs.Responses.AdminDashboard;

namespace ToeicGenius.Services.Interfaces;

public interface IAdminDashboardService
{
    Task<AdminDashboardStatisticsResponseDto> GetDashboardStatisticsAsync();
    Task<List<UserStatisticsByMonthResponseDto>> GetUserStatisticsByMonthAsync(int months = 12);
    Task<List<TestCompletionsByDayResponseDto>> GetTestCompletionsByDayAsync(int days = 7);
    Task<List<RecentActivityResponseDto>> GetRecentActivitiesAsync(int limit = 20);
}
