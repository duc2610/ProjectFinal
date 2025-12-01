using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using Xunit;

namespace ToeicGenius.Tests.UnitTests;

public class AdminDashboardServiceTests
{
	#region 1. AdminDashboardService_GetDashboardStatisticsAsync
	// UTCID01: Input = repository counts for totals/new items; Expected = aggregates and deltas mapped to DTO.
	[Fact]
	public async Task GetDashboardStatisticsAsync_WhenRepositoriesReturnCounts_MapsIntoDto()
	{
		var service = CreateService(
			out _,
			out var userRepoMock,
			out var testRepoMock,
			out var testResultRepoMock,
			out var questionRepoMock);

		userRepoMock.Setup(r => r.CountAsync()).ReturnsAsync(1200);
		userRepoMock.SetupSequence(r => r.CountAsync(It.IsAny<Expression<Func<User, bool>>>()))
			.ReturnsAsync(900) // Active users
			.ReturnsAsync(80)  // Banned users
			.ReturnsAsync(140) // New users current period
			.ReturnsAsync(100); // New users previous period

		testRepoMock.Setup(r => r.CountAsync()).ReturnsAsync(250);
		testRepoMock.SetupSequence(r => r.CountAsync(It.IsAny<Expression<Func<Test, bool>>>()))
			.ReturnsAsync(40) // New tests current period
			.ReturnsAsync(30); // New tests previous period

		questionRepoMock.Setup(r => r.CountAsync()).ReturnsAsync(4200);
		testResultRepoMock.Setup(r => r.CountAsync()).ReturnsAsync(560);

		var result = await service.GetDashboardStatisticsAsync();

		result.TotalUsers.Should().Be(1200);
		result.ActiveUsers.Should().Be(900);
		result.BannedUsers.Should().Be(80);
		result.TotalTests.Should().Be(250);
		result.TotalQuestions.Should().Be(4200);
		result.TotalTestResults.Should().Be(560);
		result.NewUsersComparedToPrevious.Should().Be(40);
		result.NewTestsComparedToPrevious.Should().Be(10);

		userRepoMock.Verify(r => r.CountAsync(), Times.Once);
		userRepoMock.Verify(r => r.CountAsync(It.IsAny<Expression<Func<User, bool>>>()), Times.Exactly(4));
		testRepoMock.Verify(r => r.CountAsync(), Times.Once);
		testRepoMock.Verify(r => r.CountAsync(It.IsAny<Expression<Func<Test, bool>>>()), Times.Exactly(2));
		questionRepoMock.Verify(r => r.CountAsync(), Times.Once);
		testResultRepoMock.Verify(r => r.CountAsync(), Times.Once);
	}
	#endregion

	#region 2. AdminDashboardService_GetUserStatisticsByMonthAsync
	// UTCID02: Input = 4-month window with sparse user creation dates; Expected = full sequence with zero-filled months.
	[Fact]
	public async Task GetUserStatisticsByMonthAsync_WhenUsersSpanMonths_ReturnsCompleteSeries()
	{
		var service = CreateService(
			out _,
			out var userRepoMock,
			out _,
			out _,
			out _);

		var now = DateTime.UtcNow;
		var users = new List<User>
		{
			new() { Id = Guid.NewGuid(), FullName = "Alice", CreatedAt = now.AddMonths(-1) },
			new() { Id = Guid.NewGuid(), FullName = "Bob", CreatedAt = now.AddMonths(-1) },
			new() { Id = Guid.NewGuid(), FullName = "Carol", CreatedAt = now.AddMonths(-3) },
			new() { Id = Guid.NewGuid(), FullName = "Outside", CreatedAt = now.AddMonths(-7) }
		};
		userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(users);

		var result = await service.GetUserStatisticsByMonthAsync(months: 4);

		result.Should().HaveCount(4);

		var monthMinus3 = now.AddMonths(-3).ToString("MM/yyyy");
		var monthMinus1 = now.AddMonths(-1).ToString("MM/yyyy");
		var currentMonth = now.ToString("MM/yyyy");

		result.First(r => r.Month == monthMinus3).UserCount.Should().Be(1);
		result.First(r => r.Month == monthMinus1).UserCount.Should().Be(2);
		result.First(r => r.Month == currentMonth).UserCount.Should().Be(0);
	}
	#endregion

	#region 3. AdminDashboardService_GetTestCompletionsByDayAsync
	// UTCID03: Input = last 3 days of test results with mixed statuses; Expected = day-by-day counts including zeros.
	[Fact]
	public async Task GetTestCompletionsByDayAsync_WhenSomeDaysHaveCompletions_ReturnsCountsPerDay()
	{
		var service = CreateService(
			out _,
			out _,
			out _,
			out var testResultRepoMock,
			out _);

		var now = DateTime.UtcNow;
		var testResults = new List<TestResult>
		{
			new() { TestResultId = 1, Status = TestResultStatus.Graded, UpdatedAt = now.AddDays(-1) },
			new() { TestResultId = 2, Status = TestResultStatus.Graded, UpdatedAt = now.AddDays(-1).AddHours(-1) },
			new() { TestResultId = 3, Status = TestResultStatus.InProgress, UpdatedAt = now.AddDays(-1) },
			new() { TestResultId = 4, Status = TestResultStatus.Graded, UpdatedAt = now.AddDays(-4) }
		};
		testResultRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(testResults);

		var result = await service.GetTestCompletionsByDayAsync(days: 3);

		result.Should().HaveCount(3);

		result.First(r => r.Date == now.AddDays(-2).ToString("dd/MM")).CompletedTestsCount.Should().Be(0);
		result.First(r => r.Date == now.AddDays(-1).ToString("dd/MM")).CompletedTestsCount.Should().Be(2);
		result.First(r => r.Date == now.Date.ToString("dd/MM")).CompletedTestsCount.Should().Be(0);
	}
	#endregion

	#region 4. AdminDashboardService_GetRecentActivitiesAsync
	// UTCID04: Input = recent registrations, completions, bans, and test creations; Expected = merged, timestamp-sorted feed with activity details.
	[Fact]
	public async Task GetRecentActivitiesAsync_WhenMixedEntitiesExist_ReturnsChronologicalFeed()
	{
		var service = CreateService(
			out _,
			out var userRepoMock,
			out var testRepoMock,
			out var testResultRepoMock,
			out _);

		var now = DateTime.UtcNow;
		var newUser = new User { Id = Guid.NewGuid(), FullName = "Newbie", CreatedAt = now.AddSeconds(-30), Status = UserStatus.Active };
		var testUser = new User { Id = Guid.NewGuid(), FullName = "Finisher", CreatedAt = now.AddHours(-2), Status = UserStatus.Active };
		var bannedUser = new User { Id = Guid.NewGuid(), FullName = "Banned", CreatedAt = now.AddDays(-3), Status = UserStatus.Banned, UpdatedAt = now.AddHours(-1) };
		var creator = new User { Id = Guid.NewGuid(), FullName = "Creator", CreatedAt = now.AddDays(-5), Status = UserStatus.Active };

		userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<User> { newUser, testUser, bannedUser, creator });

		var gradedResult = new TestResult
		{
			TestResultId = 11,
			TestId = 500,
			UserId = testUser.Id,
			Status = TestResultStatus.Graded,
			UpdatedAt = now.AddMinutes(-10)
		};
		var otherResult = new TestResult
		{
			TestResultId = 12,
			TestId = 501,
			UserId = testUser.Id,
			Status = TestResultStatus.InProgress,
			UpdatedAt = now.AddMinutes(-5)
		};
		testResultRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<TestResult> { gradedResult, otherResult });

		var completionTest = new Test { TestId = 500, Title = "LR Mock", CreatedAt = now.AddDays(-10), CreatedById = creator.Id };
		var newTest = new Test { TestId = 600, Title = "Writing Builder", CreatedAt = now.AddMinutes(-20), CreatedById = creator.Id };
		testRepoMock.Setup(r => r.GetByIdAsync(completionTest.TestId)).ReturnsAsync(completionTest);
		testRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Test> { completionTest, newTest });

		userRepoMock.Setup(r => r.GetByIdAsync(testUser.Id)).ReturnsAsync(testUser);
		userRepoMock.Setup(r => r.GetByIdAsync(creator.Id)).ReturnsAsync(creator);

		var result = await service.GetRecentActivitiesAsync(limit: 10);

		result.Should().Contain(a => a.ActivityType == "Đăng ký mới" && a.UserName == newUser.FullName);
		result.Should().Contain(a => a.ActivityType == "Hoàn thành bài thi" && a.Details.Contains("LR Mock"));
		result.Should().Contain(a => a.ActivityType == "Bị cấm" && a.UserName == bannedUser.FullName);
		result.Should().Contain(a => a.ActivityType == "Tạo bài thi mới" && a.UserName == creator.FullName && a.Details.Contains("Writing Builder"));
		result.Should().BeInDescendingOrder(a => a.Timestamp);
	}
	#endregion

	#region Helper Methods
	private AdminDashboardService CreateService(
		out Mock<IUnitOfWork> uowMock,
		out Mock<IUserRepository> userRepoMock,
		out Mock<ITestRepository> testRepoMock,
		out Mock<ITestResultRepository> testResultRepoMock,
		out Mock<IQuestionRepository> questionRepoMock)
	{
		uowMock = new Mock<IUnitOfWork>();
		userRepoMock = new Mock<IUserRepository>();
		testRepoMock = new Mock<ITestRepository>();
		testResultRepoMock = new Mock<ITestResultRepository>();
		questionRepoMock = new Mock<IQuestionRepository>();

		uowMock.SetupGet(u => u.Users).Returns(userRepoMock.Object);
		uowMock.SetupGet(u => u.Tests).Returns(testRepoMock.Object);
		uowMock.SetupGet(u => u.TestResults).Returns(testResultRepoMock.Object);
		uowMock.SetupGet(u => u.Questions).Returns(questionRepoMock.Object);

		return new AdminDashboardService(uowMock.Object);
	}
	#endregion
}
	

