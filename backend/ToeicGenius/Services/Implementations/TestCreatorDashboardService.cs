using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Responses.TestCreatorDashboard;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations;

public class TestCreatorDashboardService : ITestCreatorDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public TestCreatorDashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TestCreatorDashboardStatisticsResponseDto> GetDashboardStatisticsAsync(Guid creatorId)
    {
        var now = DateTime.UtcNow;
        var startOfCurrentPeriod = now.AddDays(-30);
        var startOfPreviousPeriod = startOfCurrentPeriod.AddDays(-30);

        // Get all tests by this creator
        var allTests = await _unitOfWork.Tests.GetAllAsync();
        var creatorTests = allTests.Where(t => t.CreatedById == creatorId).ToList();

        // Total tests
        var totalTests = creatorTests.Count;
        var publishedTests = creatorTests.Count(t => t.VisibilityStatus == TestVisibilityStatus.Published);
        var draftTests = creatorTests.Count(t => t.VisibilityStatus == TestVisibilityStatus.Hidden || t.CreationStatus != TestCreationStatus.Completed);
        var publishedPercentage = totalTests > 0 ? Math.Round((decimal)publishedTests * 100 / totalTests, 0) : 0;

        // Total questions created by this creator
        var allQuestions = await _unitOfWork.Questions.GetAllAsync();
        var totalQuestions = allQuestions.Count();

        // Get test results for creator's tests
        var testIds = creatorTests.Select(t => t.TestId).ToList();
        var allTestResults = await _unitOfWork.TestResults.GetAllAsync();
        var creatorTestResults = allTestResults
            .Where(tr => testIds.Contains(tr.TestId) && tr.Status == TestResultStatus.Graded)
            .ToList();

        var totalTestResults = creatorTestResults.Count;
        var averageScore = totalTestResults > 0
            ? Math.Round(creatorTestResults.Average(tr => tr.TotalScore), 1)
            : 0;

        // Compare with previous period
        var newTestsCurrentPeriod = creatorTests.Count(t => t.CreatedAt >= startOfCurrentPeriod && t.CreatedAt < now);
        var newTestsPreviousPeriod = creatorTests.Count(t => t.CreatedAt >= startOfPreviousPeriod && t.CreatedAt < startOfCurrentPeriod);

        var newQuestionsCurrentPeriod = allQuestions.Count(q => q.CreatedAt >= startOfCurrentPeriod && q.CreatedAt < now);
        var newQuestionsPreviousPeriod = allQuestions.Count(q => q.CreatedAt >= startOfPreviousPeriod && q.CreatedAt < startOfCurrentPeriod);

        return new TestCreatorDashboardStatisticsResponseDto
        {
            TotalTests = totalTests,
            PublishedTests = publishedTests,
            DraftTests = draftTests,
            TotalQuestions = totalQuestions,
            TotalTestResults = totalTestResults,
            AverageScore = averageScore,
            PublishedPercentage = publishedPercentage,
            NewTestsComparedToPrevious = newTestsCurrentPeriod - newTestsPreviousPeriod,
            NewQuestionsComparedToPrevious = newQuestionsCurrentPeriod - newQuestionsPreviousPeriod
        };
    }

    public async Task<List<TestPerformanceByDayResponseDto>> GetTestPerformanceByDayAsync(Guid creatorId, int days = 7)
    {
        var now = DateTime.UtcNow;
        var startDate = now.AddDays(-days);

        // Get creator's tests
        var allTests = await _unitOfWork.Tests.GetAllAsync();
        var testIds = allTests
            .Where(t => t.CreatedById == creatorId)
            .Select(t => t.TestId)
            .ToList();

        // Get test results for creator's tests
        var allTestResults = await _unitOfWork.TestResults.GetAllAsync();
        var creatorTestResults = allTestResults
            .Where(tr => testIds.Contains(tr.TestId)
                && tr.Status == TestResultStatus.Graded
                && tr.UpdatedAt.HasValue
                && tr.UpdatedAt.Value >= startDate)
            .ToList();

        // Group by day
        var performanceByDay = creatorTestResults
            .GroupBy(tr => tr.UpdatedAt!.Value.Date)
            .Select(g => new TestPerformanceByDayResponseDto
            {
                Date = g.Key.ToString("dd/MM"),
                CompletedCount = g.Count(),
                AverageScore = Math.Round(g.Average(tr => tr.TotalScore), 1),
                AveragePercentage = Math.Round(g.Average(tr => tr.TotalScore), 0)
            })
            .ToList();

        // Ensure all days are included
        var result = new List<TestPerformanceByDayResponseDto>();
        for (int i = days - 1; i >= 0; i--)
        {
            var date = now.AddDays(-i).Date;
            var dateKey = date.ToString("dd/MM");
            var performance = performanceByDay.FirstOrDefault(p => p.Date == dateKey);

            result.Add(new TestPerformanceByDayResponseDto
            {
                Date = dateKey,
                CompletedCount = performance?.CompletedCount ?? 0,
                AverageScore = performance?.AverageScore ?? 0,
                AveragePercentage = performance?.AveragePercentage ?? 0
            });
        }

        return result;
    }

    public async Task<List<TopPerformingTestResponseDto>> GetTopPerformingTestsAsync(Guid creatorId, int limit = 5)
    {
        // Get creator's tests
        var allTests = await _unitOfWork.Tests.GetAllAsync();
        var creatorTests = allTests
            .Where(t => t.CreatedById == creatorId)
            .ToList();

        // Get test results
        var allTestResults = await _unitOfWork.TestResults.GetAllAsync();
        var testPerformances = new List<TopPerformingTestResponseDto>();

        foreach (var test in creatorTests)
        {
            var testResults = allTestResults
                .Where(tr => tr.TestId == test.TestId && tr.Status == TestResultStatus.Graded)
                .ToList();

            if (testResults.Any())
            {
                testPerformances.Add(new TopPerformingTestResponseDto
                {
                    TestId = test.TestId,
                    Title = test.Title,
                    VisibilityStatus = test.VisibilityStatus,
                    VisibilityStatusText = test.VisibilityStatus == TestVisibilityStatus.Published ? "published" : "hidden",
                    CompletedCount = testResults.Count,
                    AverageScore = Math.Round(testResults.Average(tr => tr.TotalScore), 1),
                    AveragePercentage = Math.Round(testResults.Average(tr => tr.TotalScore), 1)
                });
            }
        }

        // Sort by average score descending and assign ranks
        var rankedTests = testPerformances
            .OrderByDescending(t => t.AveragePercentage)
            .ThenByDescending(t => t.CompletedCount)
            .Take(limit)
            .Select((t, index) =>
            {
                t.Rank = index + 1;
                return t;
            })
            .ToList();

        return rankedTests;
    }

    public async Task<List<TestCreatorRecentActivityResponseDto>> GetRecentActivitiesAsync(Guid creatorId, int limit = 20)
    {
        var activities = new List<TestCreatorRecentActivityResponseDto>();

        // Get creator's tests
        var allTests = await _unitOfWork.Tests.GetAllAsync();
        var creatorTests = allTests
            .Where(t => t.CreatedById == creatorId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToList();

        // Activity: Tạo bài thi mới
        foreach (var test in creatorTests)
        {
            activities.Add(new TestCreatorRecentActivityResponseDto
            {
                ActivityType = "Tạo bài thi mới",
                Details = $"Bài thi: {test.Title}",
                Status = "info",
                Timestamp = test.CreatedAt,
                TimeAgo = GetTimeAgo(test.CreatedAt)
            });
        }

        // Activity: Xuất bản bài thi (tests that were published)
        var publishedTests = allTests
            .Where(t => t.CreatedById == creatorId
                && t.VisibilityStatus == TestVisibilityStatus.Published
                && t.UpdatedAt.HasValue)
            .OrderByDescending(t => t.UpdatedAt)
            .Take(limit / 2)
            .ToList();

        foreach (var test in publishedTests)
        {
            if (test.UpdatedAt.HasValue)
            {
                activities.Add(new TestCreatorRecentActivityResponseDto
                {
                    ActivityType = "Xuất bản bài thi",
                    Details = $"Bài thi: {test.Title}",
                    Status = "success",
                    Timestamp = test.UpdatedAt.Value,
                    TimeAgo = GetTimeAgo(test.UpdatedAt.Value)
                });
            }
        }

        // Activity: Cập nhật bài thi
        var updatedTests = allTests
            .Where(t => t.CreatedById == creatorId
                && t.UpdatedAt.HasValue
                && t.UpdatedAt.Value > t.CreatedAt)
            .OrderByDescending(t => t.UpdatedAt)
            .Take(limit / 3)
            .ToList();

        foreach (var test in updatedTests)
        {
            if (test.UpdatedAt.HasValue)
            {
                activities.Add(new TestCreatorRecentActivityResponseDto
                {
                    ActivityType = "Cập nhật bài thi",
                    Details = $"Bài thi: {test.Title}",
                    Status = "info",
                    Timestamp = test.UpdatedAt.Value,
                    TimeAgo = GetTimeAgo(test.UpdatedAt.Value)
                });
            }
        }

        // Activity: Thêm câu hỏi (recent questions)
        var allQuestions = await _unitOfWork.Questions.GetAllAsync();
        var recentQuestions = allQuestions
            .OrderByDescending(q => q.CreatedAt)
            .Take(limit / 3)
            .ToList();

        foreach (var question in recentQuestions)
        {
            activities.Add(new TestCreatorRecentActivityResponseDto
            {
                ActivityType = "Thêm câu hỏi",
                Details = $"Số lượng: 1",
                Status = "success",
                Timestamp = question.CreatedAt,
                TimeAgo = GetTimeAgo(question.CreatedAt)
            });
        }

        // Sort all activities by timestamp and take most recent
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
