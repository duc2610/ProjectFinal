using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
    public class UserTestRepository : BaseRepository<TestResult, int>, IUserTestRepository
    {
        private readonly ILogger<UserTestRepository>? _logger;

        public UserTestRepository(ToeicGeniusDbContext context) : base(context) { }

        // Constructor with logger (optional - inject n?u có)
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
                    .Where(ut => ut.UserId == userId && ut.Status == "InProgress")
                    .OrderByDescending(ut => ut.StartTime)
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
                // 1. Ki?m tra xem có active test không
                var activeTest = await GetActiveTestByUserIdAsync(userId);
                if (activeTest != null)
                {
                    _logger?.LogInformation("Found existing active test: {UserTestId} for user {UserId}",
                        activeTest.UserTestId, userId);
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
                    Status = "InProgress",
                    StartTime = DateTime.UtcNow,
                    Duration = 0,
                    TotalScore = 0,
                    TestMode = "Practice",
                    CreatedAt = DateTime.UtcNow
                };

                await _context.TestResults.AddAsync(newTest);

                // 4. ? Save changes ?? có UserTestId
                await _context.SaveChangesAsync();

                _logger?.LogInformation("Created new UserTest: {UserTestId} for user {UserId}",
                    newTest.UserTestId, userId);

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

                userTest.Status = "Completed";
                userTest.TotalScore = totalScore;
                userTest.UpdatedAt = DateTime.UtcNow;

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

         
    }
}