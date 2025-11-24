using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
    public interface ITestResultRepository : IBaseRepository<TestResult, int>
    {
        /// <summary>
        /// L?y TestResult ?ang active (Status = TestResultStatus.InProgress) c?a user
        /// </summary>
        Task<TestResult?> GetActiveTestByUserIdAsync(Guid userId);
		Task<TestResult?> GetActiveTestByUserAndTestAsync(Guid userId, int testId);

        /// <summary>
        /// L?y ho?c t?o TestResult active cho user. N?u ch?a c� th� t?o m?i.
        /// </summary>
        Task<TestResult> GetOrCreateActiveTestAsync(Guid userId, int defaultTestId = 1);

        /// <summary>
        /// Ho�n th�nh m?t TestResult v� c?p nh?t TotalScore
        /// </summary>
        Task<bool> CompleteTestAsync(int TestResultId, decimal totalScore);

        /// <summary>
        /// L?y l?ch s? c�c b�i test c?a user
        /// </summary>
        Task<List<TestResult>> GetTestResultHistoryAsync(Guid userId, int skip = 0, int take = 10);

        /// <summary>
        /// Ki?m tra Test c� t?n t?i kh�ng
        /// </summary>
        Task<bool> TestExistsAsync(int testId);
		Task<GeneralLRResultDto> GetTestResultLRAsync(int testResultId);
		Task<TestResult?> GetListeningReadingResultDetailAsync(int testResultId, Guid userId);
		Task<List<TestResult>> GetResultsWithinRangeAsync(Guid examineeId, DateTime? fromDate);

		/// <summary>
		/// Get all InProgress test results that have exceeded their duration + grace period
		/// Used by background service to auto-submit expired tests
		/// </summary>
		Task<List<TestResult>> GetExpiredInProgressTestsAsync();

		/// <summary>
		/// Get TestResult with Test and SkillScores included
		/// </summary>
		Task<TestResult?> GetTestResultWithDetailsAsync(int testResultId);
	}
}