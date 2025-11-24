using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IQuestionReportRepository : IBaseRepository<QuestionReport, int>
	{
		/// <summary>
		/// Create a new question report
		/// </summary>
		Task<QuestionReport> CreateReportAsync(QuestionReport report);

		/// <summary>
		/// Get report by ID with related data (TestQuestion, Reporter, Reviewer)
		/// </summary>
		Task<QuestionReport?> GetReportByIdAsync(int reportId);

		/// <summary>
		/// Get all reports with pagination and filtering
		/// </summary>
		Task<List<QuestionReport>> GetReportsAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			Guid? reportedBy = null,
			int skip = 0,
			int take = 20);

		/// <summary>
		/// Get total count of reports (for pagination)
		/// </summary>
		Task<int> GetReportsCountAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			Guid? reportedBy = null);

		/// <summary>
		/// Update report status and review info
		/// </summary>
		Task<QuestionReport> UpdateReportAsync(QuestionReport report);

		/// <summary>
		/// Check if user has already reported this question
		/// </summary>
		Task<bool> HasUserReportedQuestionAsync(int testQuestionId, Guid userId);

		/// <summary>
		/// Get pending reports count (for admin dashboard)
		/// </summary>
		Task<int> GetPendingReportsCountAsync();
	}
}
