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

        // Get all tests by this creator ONLY
        var allTests = await _unitOfWork.Tests.GetAllAsync();
        var creatorTests = allTests.Where(t => t.CreatedById == creatorId).ToList();
        var testIds = creatorTests.Select(t => t.TestId).ToList();

        // Total tests
        var totalTests = creatorTests.Count;
        var publishedTests = creatorTests.Count(t => t.VisibilityStatus == TestVisibilityStatus.Published);
        var draftTests = creatorTests.Count(t => t.VisibilityStatus == TestVisibilityStatus.Hidden || t.CreationStatus != TestCreationStatus.Completed);
        var publishedPercentage = totalTests > 0 ? Math.Round((decimal)publishedTests * 100 / totalTests, 0) : 0;

        // Total questions in creator's tests (TestQuestions belong to their tests)
        var allTestQuestions = await _unitOfWork.TestQuestions.GetAllAsync();
        var creatorTestQuestions = allTestQuestions.Where(tq => testIds.Contains(tq.TestId)).ToList();
        var totalQuestions = creatorTestQuestions.Count;

        // Get test results for creator's tests ONLY
        var allTestResults = await _unitOfWork.TestResults.GetAllAsync();
        var creatorTestResults = allTestResults
            .Where(tr => testIds.Contains(tr.TestId) && tr.Status == TestResultStatus.Graded)
            .ToList();

        var totalTestResults = creatorTestResults.Count;
        var averageScore = totalTestResults > 0
            ? Math.Round(creatorTestResults.Average(tr => tr.TotalScore), 1)
            : 0;

        // Compare with previous period - tests created by this creator
        var newTestsCurrentPeriod = creatorTests.Count(t => t.CreatedAt >= startOfCurrentPeriod && t.CreatedAt < now);
        var newTestsPreviousPeriod = creatorTests.Count(t => t.CreatedAt >= startOfPreviousPeriod && t.CreatedAt < startOfCurrentPeriod);

        // Compare with previous period - questions in creator's tests
        var newQuestionsCurrentPeriod = creatorTestQuestions.Count(tq => tq.CreatedAt >= startOfCurrentPeriod && tq.CreatedAt < now);
        var newQuestionsPreviousPeriod = creatorTestQuestions.Count(tq => tq.CreatedAt >= startOfPreviousPeriod && tq.CreatedAt < startOfCurrentPeriod);

        // Get question reports for creator's tests (reports về câu hỏi trong tests của họ)
        var testQuestionIds = creatorTestQuestions.Select(tq => tq.TestQuestionId).ToList();
        var pendingReports = await _unitOfWork.QuestionReports.GetPendingReportsCountAsync(creatorId);
        var totalReports = await _unitOfWork.QuestionReports.GetReportsCountAsync(null, null, null, creatorId);

        return new TestCreatorDashboardStatisticsResponseDto
        {
            TotalTests = totalTests,
            PublishedTests = publishedTests,
            DraftTests = draftTests,
            TotalQuestions = totalQuestions,
            TotalTestResults = totalTestResults,
            AverageScore = averageScore,
            PublishedPercentage = publishedPercentage,
            PendingReports = pendingReports,
            TotalReports = totalReports,
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

        // Get creator's tests ONLY
        var allTests = await _unitOfWork.Tests.GetAllAsync();
        var creatorTests = allTests
            .Where(t => t.CreatedById == creatorId)
            .ToList();
        var testIds = creatorTests.Select(t => t.TestId).ToList();

        // Activity: Tạo bài thi mới (creator's tests only)
        var recentCreatedTests = creatorTests
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .ToList();

        foreach (var test in recentCreatedTests)
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

        // Activity: Xuất bản bài thi (creator's tests that were published)
        var publishedTests = creatorTests
            .Where(t => t.VisibilityStatus == TestVisibilityStatus.Published
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

        // Activity: Cập nhật bài thi (creator's tests only)
        var updatedTests = creatorTests
            .Where(t => t.UpdatedAt.HasValue
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

        // Activity: Thêm câu hỏi vào tests của creator (TestQuestions in their tests)
        var allTestQuestions = await _unitOfWork.TestQuestions.GetAllAsync();
        var creatorTestQuestions = allTestQuestions
            .Where(tq => testIds.Contains(tq.TestId))
            .OrderByDescending(tq => tq.CreatedAt)
            .Take(limit / 3)
            .ToList();

        // Group by test to show meaningful activity
        var questionsByTest = creatorTestQuestions
            .GroupBy(tq => new { tq.TestId, Date = tq.CreatedAt.Date })
            .Take(limit / 3);

        foreach (var group in questionsByTest)
        {
            var test = creatorTests.FirstOrDefault(t => t.TestId == group.Key.TestId);
            if (test != null)
            {
                var firstQuestion = group.First();
                activities.Add(new TestCreatorRecentActivityResponseDto
                {
                    ActivityType = "Thêm câu hỏi",
                    Details = $"Bài thi: {test.Title} ({group.Count()} câu)",
                    Status = "success",
                    Timestamp = firstQuestion.CreatedAt,
                    TimeAgo = GetTimeAgo(firstQuestion.CreatedAt)
                });
            }
        }

        // Activity: Có người làm bài thi của creator (test results for their tests)
        var allTestResults = await _unitOfWork.TestResults.GetAllAsync();
        var creatorTestResults = allTestResults
            .Where(tr => testIds.Contains(tr.TestId) && tr.Status == TestResultStatus.Graded && tr.UpdatedAt.HasValue)
            .OrderByDescending(tr => tr.UpdatedAt)
            .Take(limit / 3)
            .ToList();

        foreach (var result in creatorTestResults)
        {
            var test = creatorTests.FirstOrDefault(t => t.TestId == result.TestId);
            if (test != null && result.UpdatedAt.HasValue)
            {
                activities.Add(new TestCreatorRecentActivityResponseDto
                {
                    ActivityType = "Có người hoàn thành bài thi",
                    Details = $"Bài thi: {test.Title} - Điểm: {result.TotalScore}",
                    Status = "success",
                    Timestamp = result.UpdatedAt.Value,
                    TimeAgo = GetTimeAgo(result.UpdatedAt.Value)
                });
            }
        }

        // Activity: Có báo cáo lỗi câu hỏi mới cho tests của creator
        var creatorReports = await _unitOfWork.QuestionReports.GetReportsAsync(null, null, null, creatorId, 0, limit / 3);
        foreach (var report in creatorReports)
        {
            var test = creatorTests.FirstOrDefault(t => t.TestId == report.TestQuestion?.TestId);
            var testName = test?.Title ?? "Không xác định";
            var statusText = report.Status switch
            {
                ReportStatus.Pending => "Chờ xử lý",
                ReportStatus.Reviewing => "Đang xem xét",
                ReportStatus.Resolved => "Đã giải quyết",
                ReportStatus.Rejected => "Đã từ chối",
                _ => "Không xác định"
            };
            var activityStatus = report.Status == ReportStatus.Pending ? "warning" :
                                 report.Status == ReportStatus.Resolved ? "success" : "info";

            activities.Add(new TestCreatorRecentActivityResponseDto
            {
                ActivityType = "Báo cáo lỗi câu hỏi",
                Details = $"Bài thi: {testName} - {report.ReportType} ({statusText})",
                Status = activityStatus,
                Timestamp = report.CreatedAt,
                TimeAgo = GetTimeAgo(report.CreatedAt)
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
