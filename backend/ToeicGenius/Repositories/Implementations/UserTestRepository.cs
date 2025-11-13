using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
    public class UserTestRepository : BaseRepository<TestResult, int>, IUserTestRepository
    {
        private readonly ILogger<UserTestRepository>? _logger;

        public UserTestRepository(ToeicGeniusDbContext context) : base(context) { }

        // Constructor with logger (optional - inject n?u c�)
        public UserTestRepository(ToeicGeniusDbContext context, ILogger<UserTestRepository> logger)
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

        public async Task<TestResult> GetOrCreateActiveTestAsync(Guid userId, int defaultTestId = 1)
        {
            try
            {
                // 1. Ki?m tra xem c� active test kh�ng
                var activeTest = await GetActiveTestByUserIdAsync(userId);
                if (activeTest != null)
                {
                    _logger?.LogInformation("Found existing active test: {TestResultId} for user {UserId}",
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
                    TestType = Domains.Enums.TestType.Practice,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.TestResults.AddAsync(newTest);

                // 4. ? Save changes ?? c� TestResultId
                await _context.SaveChangesAsync();

                _logger?.LogInformation("Created new UserTest: {TestResultId} for user {UserId}",
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

        public async Task<bool> CompleteTestAsync(int testResultId, decimal totalScore)
        {
            try
            {
                var userTest = await _context.TestResults.FindAsync(testResultId);
                if (userTest == null)
                {
                    _logger?.LogWarning("UserTest {TestResultId} not found for completion", testResultId);
                    return false;
                }

                userTest.Status = TestResultStatus.Graded;
                userTest.TotalScore = totalScore;
                userTest.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger?.LogInformation("Completed UserTest {TestResultId} with score {TotalScore}",
                    testResultId, totalScore);

                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error completing UserTest {TestResultId}", testResultId);
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

         
    }
}