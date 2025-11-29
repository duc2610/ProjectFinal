using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using Xunit;

namespace ToeicGenius.Tests.UnitTests;

public class TestCreatorDashboardServiceTests
{
	private readonly Guid _creatorId = Guid.NewGuid();

	#region 1. TestCreatorDashboardService_GetDashboardStatisticsAsync
	// UTCID01: Input = creator with mix of published/draft tests and graded results; Expected = totals, percentages, deltas mapped.
	[Fact]
	public async Task GetDashboardStatisticsAsync_WhenCreatorHasData_ReturnsAggregatedStats()
	{
		var service = CreateService(
			out _,
			out var testRepoMock,
			out var questionRepoMock,
			out var testResultRepoMock);

		var now = DateTime.UtcNow;
		var creatorTests = new List<Test>
		{
			new() { TestId = 1, CreatedById = _creatorId, VisibilityStatus = TestVisibilityStatus.Published, CreationStatus = TestCreationStatus.Completed, CreatedAt = now.AddDays(-10) },
			new() { TestId = 2, CreatedById = _creatorId, VisibilityStatus = TestVisibilityStatus.Hidden, CreationStatus = TestCreationStatus.Draft, CreatedAt = now.AddDays(-35) },
			new() { TestId = 3, CreatedById = Guid.NewGuid(), VisibilityStatus = TestVisibilityStatus.Hidden, CreationStatus = TestCreationStatus.Completed, CreatedAt = now }
		};
		testRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(creatorTests);

		var questions = new List<Question>
		{
			new() { QuestionId = 1, CreatedAt = now.AddDays(-5) },
			new() { QuestionId = 2, CreatedAt = now.AddDays(-40) },
			new() { QuestionId = 3, CreatedAt = now.AddDays(-20) }
		};
		questionRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(questions);

		var testResults = new List<TestResult>
		{
			new() { TestResultId = 1, TestId = 1, Status = TestResultStatus.Graded, TotalScore = 160, UpdatedAt = now.AddDays(-2) },
			new() { TestResultId = 2, TestId = 1, Status = TestResultStatus.Graded, TotalScore = 140, UpdatedAt = now.AddDays(-1) },
			new() { TestResultId = 3, TestId = 2, Status = TestResultStatus.InProgress, TotalScore = 100 }
		};
		testResultRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(testResults);

		var result = await service.GetDashboardStatisticsAsync(_creatorId);

		result.TotalTests.Should().Be(2);
		result.PublishedTests.Should().Be(1);
		result.DraftTests.Should().Be(1);
		result.TotalQuestions.Should().Be(3);
		result.TotalTestResults.Should().Be(2);
		result.AverageScore.Should().Be(150);
		result.PublishedPercentage.Should().Be(50);
		result.NewTestsComparedToPrevious.Should().Be(1);
		result.NewQuestionsComparedToPrevious.Should().Be(1);
	}
	#endregion

	#region 2. TestCreatorDashboardService_GetTestPerformanceByDayAsync
	// UTCID02: Input = days=3 with graded results on one day; Expected = per-day entries with zero-filled gaps.
	[Fact]
	public async Task GetTestPerformanceByDayAsync_WithSparseResults_ReturnsCompleteWindow()
	{
		var service = CreateService(
			out _,
			out var testRepoMock,
			out _,
			out var testResultRepoMock);

		var now = DateTime.UtcNow;
		var tests = new List<Test>
		{
			new() { TestId = 10, CreatedById = _creatorId, CreatedAt = now.AddDays(-5) },
			new() { TestId = 11, CreatedById = Guid.NewGuid(), CreatedAt = now.AddDays(-1) }
		};
		testRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tests);

		var results = new List<TestResult>
		{
			new() { TestResultId = 1, TestId = 10, Status = TestResultStatus.Graded, TotalScore = 180, UpdatedAt = now.AddDays(-1) },
			new() { TestResultId = 2, TestId = 10, Status = TestResultStatus.Graded, TotalScore = 150, UpdatedAt = now.AddDays(-1) },
			new() { TestResultId = 3, TestId = 10, Status = TestResultStatus.Graded, TotalScore = 120, UpdatedAt = now.AddDays(-5) }
		};
		testResultRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(results);

		var result = await service.GetTestPerformanceByDayAsync(_creatorId, days: 3);

		result.Should().HaveCount(3);
		result.First(r => r.Date == now.AddDays(-2).ToString("dd/MM")).CompletedCount.Should().Be(0);
		var dayMinus1 = result.First(r => r.Date == now.AddDays(-1).ToString("dd/MM"));
		dayMinus1.CompletedCount.Should().Be(2);
		dayMinus1.AverageScore.Should().Be(165);
		result.First(r => r.Date == now.Date.ToString("dd/MM")).CompletedCount.Should().Be(0);
	}
	#endregion

	#region 3. TestCreatorDashboardService_GetTopPerformingTestsAsync
	// UTCID03: Input = tests with graded results; Expected = ranked list ordered by avg percentage and completions.
	[Fact]
	public async Task GetTopPerformingTestsAsync_WhenCreatorHasMultipleTests_ReturnsRankedTop()
	{
		var service = CreateService(
			out _,
			out var testRepoMock,
			out _,
			out var testResultRepoMock);

		var tests = new List<Test>
		{
			new() { TestId = 100, Title = "Gold", CreatedById = _creatorId, VisibilityStatus = TestVisibilityStatus.Published },
			new() { TestId = 101, Title = "Silver", CreatedById = _creatorId, VisibilityStatus = TestVisibilityStatus.Hidden },
			new() { TestId = 102, Title = "Others", CreatedById = Guid.NewGuid(), VisibilityStatus = TestVisibilityStatus.Hidden }
		};
		testRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tests);

		var results = new List<TestResult>
		{
			new() { TestId = 100, Status = TestResultStatus.Graded, TotalScore = 150 },
			new() { TestId = 100, Status = TestResultStatus.Graded, TotalScore = 170 },
			new() { TestId = 101, Status = TestResultStatus.Graded, TotalScore = 120 },
			new() { TestId = 101, Status = TestResultStatus.Graded, TotalScore = 125 },
			new() { TestId = 101, Status = TestResultStatus.Graded, TotalScore = 130 }
		};
		testResultRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(results);

		var ranked = await service.GetTopPerformingTestsAsync(_creatorId, limit: 2);

		ranked.Should().HaveCount(2);
		ranked[0].TestId.Should().Be(100);
		ranked[0].AverageScore.Should().Be(160);
		ranked[0].Rank.Should().Be(1);
		ranked[1].TestId.Should().Be(101);
		ranked[1].CompletedCount.Should().Be(3);
		ranked[1].Rank.Should().Be(2);
	}
	#endregion

	#region 4. TestCreatorDashboardService_GetRecentActivitiesAsync
	// UTCID04: Input = creator tests in various states plus recent questions; Expected = merged activity feed sorted by timestamp.
	[Fact]
	public async Task GetRecentActivitiesAsync_WhenCreatorHasActivities_ReturnsChronologicalFeed()
	{
		var service = CreateService(
			out _,
			out var testRepoMock,
			out var questionRepoMock,
			out _);

		var now = DateTime.UtcNow;
		var tests = new List<Test>
		{
			new() { TestId = 1, Title = "New Test", CreatedById = _creatorId, CreatedAt = now.AddMinutes(-5), VisibilityStatus = TestVisibilityStatus.Hidden },
			new() { TestId = 2, Title = "Published Test", CreatedById = _creatorId, CreatedAt = now.AddDays(-2), VisibilityStatus = TestVisibilityStatus.Published, UpdatedAt = now.AddMinutes(-15) },
			new() { TestId = 3, Title = "Updated Test", CreatedById = _creatorId, CreatedAt = now.AddDays(-4), VisibilityStatus = TestVisibilityStatus.Hidden, UpdatedAt = now.AddMinutes(-30) },
			new() { TestId = 4, Title = "Other", CreatedById = Guid.NewGuid(), CreatedAt = now }
		};
		testRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(tests);

		var questions = new List<Question>
		{
			new() { QuestionId = 1, CreatedAt = now.AddMinutes(-2) },
			new() { QuestionId = 2, CreatedAt = now.AddHours(-3) }
		};
		questionRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(questions);

		var activities = await service.GetRecentActivitiesAsync(_creatorId, limit: 5);

		activities.Should().Contain(a => a.ActivityType == "Tạo bài thi mới" && a.Details.Contains("New Test"));
		activities.Should().Contain(a => a.ActivityType == "Xuất bản bài thi" && a.Details.Contains("Published Test"));
		activities.Should().Contain(a => a.ActivityType == "Cập nhật bài thi" && a.Details.Contains("Updated Test"));
		activities.Should().Contain(a => a.ActivityType == "Thêm câu hỏi");
		activities.Should().BeInDescendingOrder(a => a.Timestamp);
	}
	#endregion

	#region Helper Methods
	private TestCreatorDashboardService CreateService(
		out Mock<IUnitOfWork> uowMock,
		out Mock<ITestRepository> testRepoMock,
		out Mock<IQuestionRepository> questionRepoMock,
		out Mock<ITestResultRepository> testResultRepoMock)
	{
		uowMock = new Mock<IUnitOfWork>();
		testRepoMock = new Mock<ITestRepository>();
		questionRepoMock = new Mock<IQuestionRepository>();
		testResultRepoMock = new Mock<ITestResultRepository>();

		uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
		uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);
		uowMock.SetupGet(u => u.TestResults).Returns(testResultRepoMock.Object);

		return new TestCreatorDashboardService(uowMock.Object);
	}
	#endregion
}
