using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
    public interface ITestResultRepository : IBaseRepository<TestResult, int>
    {
        /// <summary>
        /// L?y TestResult ?ang active (Status = "InProgress") c?a user
        /// </summary>
        Task<TestResult?> GetActiveTestByUserIdAsync(Guid userId);

        /// <summary>
        /// L?y ho?c t?o TestResult active cho user. N?u ch?a có thì t?o m?i.
        /// </summary>
        Task<TestResult> GetOrCreateActiveTestAsync(Guid userId, int defaultTestId = 1);

        /// <summary>
        /// Hoàn thành m?t TestResult và c?p nh?t TotalScore
        /// </summary>
        Task<bool> CompleteTestAsync(int TestResultId, decimal totalScore);

        /// <summary>
        /// L?y l?ch s? các bài test c?a user
        /// </summary>
        Task<List<TestResult>> GetTestResultHistoryAsync(Guid userId, int skip = 0, int take = 10);

        /// <summary>
        /// Ki?m tra Test có t?n t?i không
        /// </summary>
        Task<bool> TestExistsAsync(int testId);
		Task<GeneralLRResultDto> GetTestResultLRAsync(int testResultId);
		Task<TestResult?> GetListeningReadingResultDetailAsync(int testResultId, Guid userId);

	}
}