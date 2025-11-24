using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Responses.AdminDashboard;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations;

public class AdminDashboardService : IAdminDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminDashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AdminDashboardStatisticsResponseDto> GetDashboardStatisticsAsync()
    {
        var now = DateTime.UtcNow;
        var startOfCurrentPeriod = now.AddDays(-30);
        var startOfPreviousPeriod = startOfCurrentPeriod.AddDays(-30);

        // Get counts
        var totalUsers = await _unitOfWork.Users.CountAsync();
        var activeUsers = await _unitOfWork.Users.CountAsync(u => u.Status == UserStatus.Active);
        var bannedUsers = await _unitOfWork.Users.CountAsync(u => u.Status == UserStatus.Banned);
        var totalTests = await _unitOfWork.Tests.CountAsync();
        var totalQuestions = await _unitOfWork.Questions.CountAsync();
        var totalTestResults = await _unitOfWork.TestResults.CountAsync();

        // Get new users in current and previous period
        var newUsersCurrentPeriod = await _unitOfWork.Users.CountAsync(u =>
            u.CreatedAt >= startOfCurrentPeriod && u.CreatedAt < now);
        var newUsersPreviousPeriod = await _unitOfWork.Users.CountAsync(u =>
            u.CreatedAt >= startOfPreviousPeriod && u.CreatedAt < startOfCurrentPeriod);

        // Get new tests in current and previous period
        var newTestsCurrentPeriod = await _unitOfWork.Tests.CountAsync(t =>
            t.CreatedAt >= startOfCurrentPeriod && t.CreatedAt < now);
        var newTestsPreviousPeriod = await _unitOfWork.Tests.CountAsync(t =>
            t.CreatedAt >= startOfPreviousPeriod && t.CreatedAt < startOfCurrentPeriod);

        return new AdminDashboardStatisticsResponseDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalTests = totalTests,
            TotalQuestions = totalQuestions,
            TotalTestResults = totalTestResults,
            BannedUsers = bannedUsers,
            NewUsersComparedToPrevious = newUsersCurrentPeriod - newUsersPreviousPeriod,
            NewTestsComparedToPrevious = newTestsCurrentPeriod - newTestsPreviousPeriod
        };
    }

    public async Task<List<UserStatisticsByMonthResponseDto>> GetUserStatisticsByMonthAsync(int months = 12)
    {
        var now = DateTime.UtcNow;
        var startDate = now.AddMonths(-months);

        var users = await _unitOfWork.Users.GetAllAsync();

        var statistics = users
            .Where(u => u.CreatedAt >= startDate)
            .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
            .Select(g => new UserStatisticsByMonthResponseDto
            {
                Month = $"{g.Key.Month:D2}/{g.Key.Year}",
                UserCount = g.Count()
            })
            .OrderBy(s => s.Month)
            .ToList();

        // Ensure all months are included even if no users registered
        var result = new List<UserStatisticsByMonthResponseDto>();
        for (int i = months - 1; i >= 0; i--)
        {
            var date = now.AddMonths(-i);
            var monthKey = $"{date.Month:D2}/{date.Year}";
            var stat = statistics.FirstOrDefault(s => s.Month == monthKey);

            result.Add(new UserStatisticsByMonthResponseDto
            {
                Month = monthKey,
                UserCount = stat?.UserCount ?? 0
            });
        }

        return result;
    }

    public async Task<List<TestCompletionsByDayResponseDto>> GetTestCompletionsByDayAsync(int days = 7)
    {
        var now = DateTime.UtcNow;
        var startDate = now.AddDays(-days);

        var testResults = await _unitOfWork.TestResults.GetAllAsync();

        var completions = testResults
            .Where(tr => tr.Status == TestResultStatus.Graded && tr.UpdatedAt.HasValue && tr.UpdatedAt.Value >= startDate)
            .GroupBy(tr => tr.UpdatedAt!.Value.Date)
            .Select(g => new TestCompletionsByDayResponseDto
            {
                Date = g.Key.ToString("dd/MM"),
                CompletedTestsCount = g.Count()
            })
            .ToList();

        // Ensure all days are included even if no tests completed
        var result = new List<TestCompletionsByDayResponseDto>();
        for (int i = days - 1; i >= 0; i--)
        {
            var date = now.AddDays(-i).Date;
            var dateKey = date.ToString("dd/MM");
            var completion = completions.FirstOrDefault(c => c.Date == dateKey);

            result.Add(new TestCompletionsByDayResponseDto
            {
                Date = dateKey,
                CompletedTestsCount = completion?.CompletedTestsCount ?? 0
            });
        }

        return result;
    }

    public async Task<List<RecentActivityResponseDto>> GetRecentActivitiesAsync(int limit = 20)
    {
        var activities = new List<RecentActivityResponseDto>();

        // Get recent user registrations
        var recentUsers = await _unitOfWork.Users
            .GetAllAsync();
        var userActivities = recentUsers
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new RecentActivityResponseDto
            {
                ActivityType = "Đăng ký mới",
                UserName = u.FullName,
                Details = "",
                Status = "success",
                Timestamp = u.CreatedAt,
                TimeAgo = GetTimeAgo(u.CreatedAt)
            });
        activities.AddRange(userActivities);

        // Get recent test completions
        var recentTestResults = await _unitOfWork.TestResults
            .GetAllAsync();

        var testActivities = new List<RecentActivityResponseDto>();
        foreach (var result in recentTestResults
            .Where(tr => tr.Status == TestResultStatus.Graded && tr.UpdatedAt.HasValue)
            .OrderByDescending(tr => tr.UpdatedAt)
            .Take(limit))
        {
            var user = await _unitOfWork.Users.GetByIdAsync(result.UserId);
            var test = await _unitOfWork.Tests.GetByIdAsync(result.TestId);

            if (user != null && test != null && result.UpdatedAt.HasValue)
            {
                testActivities.Add(new RecentActivityResponseDto
                {
                    ActivityType = "Hoàn thành bài thi",
                    UserName = user.FullName,
                    Details = $"Bài thi: {test.Title}",
                    Status = "success",
                    Timestamp = result.UpdatedAt.Value,
                    TimeAgo = GetTimeAgo(result.UpdatedAt.Value)
                });
            }
        }
        activities.AddRange(testActivities);

        // Get recent banned users
        var bannedUsers = recentUsers
            .Where(u => u.Status == UserStatus.Banned && u.UpdatedAt.HasValue)
            .OrderByDescending(u => u.UpdatedAt)
            .Take(limit / 2);
        var bannedActivities = bannedUsers.Select(u => new RecentActivityResponseDto
        {
            ActivityType = "Bị cấm",
            UserName = u.FullName,
            Details = "",
            Status = "error",
            Timestamp = u.UpdatedAt!.Value,
            TimeAgo = GetTimeAgo(u.UpdatedAt!.Value)
        });
        activities.AddRange(bannedActivities);

        // Get recently created tests
        var recentTests = await _unitOfWork.Tests
            .GetAllAsync();

        var testCreationActivities = new List<RecentActivityResponseDto>();
        foreach (var test in recentTests
            .Where(t => t.CreatedById.HasValue)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit / 2))
        {
            var creator = await _unitOfWork.Users.GetByIdAsync(test.CreatedById!.Value);
            if (creator != null)
            {
                testCreationActivities.Add(new RecentActivityResponseDto
                {
                    ActivityType = "Tạo bài thi mới",
                    UserName = creator.FullName,
                    Details = $"Bài thi: {test.Title}",
                    Status = "info",
                    Timestamp = test.CreatedAt,
                    TimeAgo = GetTimeAgo(test.CreatedAt)
                });
            }
        }
        activities.AddRange(testCreationActivities);

        // Sort all activities by timestamp and take the most recent ones
        return activities
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToList();
    }

    private string GetTimeAgo(DateTime dateTime)
    {
        var timeSpan = DateTime.UtcNow - dateTime;

        if (timeSpan.TotalMinutes < 1)
            return "vừa xong";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} phút trước";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours} giờ trước";
        if (timeSpan.TotalDays < 7)
            return $"{(int)timeSpan.TotalDays} ngày trước";
        if (timeSpan.TotalDays < 30)
            return $"{(int)(timeSpan.TotalDays / 7)} tuần trước";
        if (timeSpan.TotalDays < 365)
            return $"{(int)(timeSpan.TotalDays / 30)} tháng trước";

        return $"{(int)(timeSpan.TotalDays / 365)} năm trước";
    }
}
