using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Repositories.Implementations
{
	public class TestResultRepository : BaseRepository<TestResult, int>, ITestResultRepository
	{
		private readonly ILogger<TestResultRepository>? _logger;

		public TestResultRepository(ToeicGeniusDbContext context) : base(context) { }

		// Constructor with logger (optional - inject n?u có)
		public TestResultRepository(ToeicGeniusDbContext context, ILogger<TestResultRepository> logger)
			: base(context)
		{
			_logger = logger;
		}

		public async Task<TestResult?> GetActiveTestByUserIdAsync(Guid userId)
		{
			try
			{
				return await _context.TestResults
					.Where(ut => ut.UserId == userId && ut.Status == TestResultStatus.InProgress)
					.OrderByDescending(ut => ut.CreatedAt)
					.FirstOrDefaultAsync();
			}
			catch (Exception ex)
			{
				_logger?.LogError(ex, "Error getting active test for user {UserId}", userId);
				throw;
			}
		}

		public async Task<TestResult?> GetActiveTestByUserAndTestAsync(Guid userId, int testId)
		{
			try
			{
				return await _context.TestResults
					.Where(ut => ut.UserId == userId && ut.TestId == testId && ut.Status == TestResultStatus.InProgress)
					.OrderByDescending(ut => ut.CreatedAt)
					.FirstOrDefaultAsync();
			}
			catch (Exception ex)
			{
				_logger?.LogError(ex, "Error getting active test for user {UserId} and test {TestId}", userId, testId);
				throw;
			}
		}

		public async Task<TestResult> GetOrCreateActiveTestAsync(Guid userId, int defaultTestId = 1)
		{
			try
			{
				// 1. Ki?m tra xem có active test không
				var activeTest = await GetActiveTestByUserIdAsync(userId);
				if (activeTest != null)
				{
					_logger?.LogInformation("Found existing active test: {UserTestId} for user {UserId}",
						activeTest.TestResultId, userId);
					return activeTest;
				}

				// 2. ? Validate TestId t?n t?i trong database
				var testExists = await TestExistsAsync(defaultTestId);
				if (!testExists)
				{
					var errorMsg = $"Test with ID {defaultTestId} does not exist. Please create a default test first.";
					_logger?.LogError(errorMsg);
					throw new Exception(errorMsg);
				}

				// 3. T?o UserTest m?i
				var newTest = new TestResult
				{
					UserId = userId,
					TestId = defaultTestId,
					Status = TestResultStatus.InProgress,
					Duration = 0,
					TotalScore = 0,
					TestType = TestType.Practice,
					CreatedAt = Now
				};

				await _context.TestResults.AddAsync(newTest);

				// 4. ? Save changes ?? có UserTestId
				await _context.SaveChangesAsync();

				_logger?.LogInformation("Created new UserTest: {UserTestId} for user {UserId}",
					newTest.TestResultId, userId);

				return newTest;
			}
			catch (DbUpdateException ex)
			{
				_logger?.LogError(ex, "Database error when creating UserTest for user {UserId}. Inner: {Inner}",
					userId, ex.InnerException?.Message);
				throw new Exception($"Failed to create UserTest: {ex.InnerException?.Message ?? ex.Message}", ex);
			}
			catch (Exception ex)
			{
				_logger?.LogError(ex, "Error in GetOrCreateActiveTestAsync for user {UserId}", userId);
				throw;
			}
		}

		public async Task<bool> CompleteTestAsync(int userTestId, decimal totalScore)
		{
			try
			{
				var userTest = await _context.TestResults.FindAsync(userTestId);
				if (userTest == null)
				{
					_logger?.LogWarning("UserTest {UserTestId} not found for completion", userTestId);
					return false;
				}

				userTest.Status = TestResultStatus.Graded;
				userTest.TotalScore = totalScore;
				userTest.UpdatedAt = Now;

				await _context.SaveChangesAsync();

				_logger?.LogInformation("Completed UserTest {UserTestId} with score {TotalScore}",
					userTestId, totalScore);

				return true;
			}
			catch (Exception ex)
			{
				_logger?.LogError(ex, "Error completing UserTest {UserTestId}", userTestId);
				throw;
			}
		}

		public async Task<List<TestResult>> GetTestResultHistoryAsync(Guid userId, int skip = 0, int take = 10)
		{
			try
			{
				return await _context.TestResults
					.Where(ut => ut.UserId == userId)
					.OrderByDescending(ut => ut.CreatedAt)
					.Skip(skip)
					.Take(take)
					.Include(ut => ut.Test)
					.Include(ut => ut.UserAnswers)
					.ToListAsync();
			}
			catch (Exception ex)
			{
				_logger?.LogError(ex, "Error getting test history for user {UserId}", userId);
				throw;
			}
		}

		public async Task<bool> TestExistsAsync(int testId)
		{
			try
			{
				return await _context.Tests.AnyAsync(t => t.TestId == testId);
			}
			catch (Exception ex)
			{
				_logger?.LogError(ex, "Error checking if Test {TestId} exists", testId);
				throw;
			}
		}
		public async Task<GeneralLRResultDto> GetTestResultLRAsync(int testResultId)
		{
			var skillScores = await _context.UserTestSkillScores
				.Where(u => u.TestResultId == testResultId)
				.ToListAsync();

			if (!skillScores.Any())
				return null;

			// Lấy tổng điểm tổng thể từ TestResult
			var testResult = await _context.TestResults
				.Where(tr => tr.TestResultId == testResultId)
				.Select(tr => new
				{
					tr.TotalScore,
					tr.Duration,
					tr.TotalQuestions,
					tr.CorrectCount,
					tr.IncorrectCount,
					tr.SkipCount
				})
				.FirstOrDefaultAsync();

			var resultDto = new GeneralLRResultDto
			{
				TotalScore = (int?)testResult?.TotalScore,
				Duration = testResult?.Duration ?? 0,
				TestResultId = testResultId
			};

			// Gán thông tin từng skill
			foreach (var s in skillScores)
			{
				if (s.Skill.Equals("Listening", StringComparison.OrdinalIgnoreCase))
				{
					resultDto.ListeningScore = (int)s.Score;
					resultDto.ListeningCorrect = s.CorrectCount;
					resultDto.ListeningTotal = s.TotalQuestions;
				}
				else if (s.Skill.Equals("Reading", StringComparison.OrdinalIgnoreCase))
				{
					resultDto.ReadingScore = (int)s.Score;
					resultDto.ReadingCorrect = s.CorrectCount;
					resultDto.ReadingTotal = s.TotalQuestions;
				}
			}

			// Tổng hợp chung
			resultDto.TotalQuestions = testResult.TotalQuestions;
			resultDto.CorrectCount = testResult.CorrectCount;
			resultDto.IncorrectCount = testResult.IncorrectCount;
			resultDto.SkipCount = testResult.SkipCount;

			return resultDto;
		}

		public async Task<TestResult?> GetListeningReadingResultDetailAsync(int testResultId, Guid userId)
		{
			return await _context.TestResults
				.Include(tr => tr.Test)
					.ThenInclude(t => t.TestQuestions)
						.ThenInclude(q => q.Part)
				.Include(tr => tr.UserAnswers)
				.Include(tr => tr.SkillScores)
				.FirstOrDefaultAsync(tr => tr.TestResultId == testResultId && tr.UserId == userId);
		}

		public async Task<List<TestResult>> GetResultsWithinRangeAsync(Guid examineeId, DateTime? fromDate)
		{
			var query = _context.TestResults
			.Include(r => r.Test)
			.Include(r => r.SkillScores)
			.Where(r => r.UserId == examineeId && r.Test.TestType == TestType.Simulator);

			if (fromDate.HasValue)
				query = query.Where(r => r.CreatedAt >= fromDate.Value);

			return await query.ToListAsync();
		}

		public async Task<List<TestResult>> GetExpiredInProgressTestsAsync()
		{
			try
			{
				// Get all InProgress test results with their test details
				var inProgressTests = await _context.TestResults
					.Include(tr => tr.Test)
					.Where(tr => tr.Status == TestResultStatus.InProgress)
					.ToListAsync();

				// Filter expired tests (CreatedAt + Duration + 5 minutes grace period < Now)
				var expiredTests = inProgressTests
					.Where(tr => tr.Test != null &&
								 Now - tr.CreatedAt > TimeSpan.FromMinutes(tr.Test.Duration + 5))
					.ToList();

				return expiredTests;
			}
			catch (Exception ex)
			{
				_logger?.LogError(ex, "Error getting expired InProgress tests");
				throw;
			}
		}

		public async Task<TestResult?> GetTestResultWithDetailsAsync(int testResultId)
		{
			return await _context.TestResults
				.Include(tr => tr.Test)
				.Include(tr => tr.SkillScores)
				.FirstOrDefaultAsync(tr => tr.TestResultId == testResultId);
		}
	}
}