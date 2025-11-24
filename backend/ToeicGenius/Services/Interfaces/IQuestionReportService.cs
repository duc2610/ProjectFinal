using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Report;
using ToeicGenius.Domains.DTOs.Responses.Report;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Shared.Wrappers;

namespace ToeicGenius.Services.Interfaces
{
	public interface IQuestionReportService
	{
		/// <summary>
		/// User reports a question issue
		/// </summary>
		Task<Result<QuestionReportDto>> CreateReportAsync(CreateQuestionReportDto request, Guid userId);

		/// <summary>
		/// Get report by ID (Admin/Test Creator only)
		/// </summary>
		Task<Result<QuestionReportDto>> GetReportByIdAsync(int reportId);

		/// <summary>
		/// Get all reports with filtering (Admin/Test Creator only)
		/// </summary>
		Task<Result<PagedResponse<QuestionReportDto>>> GetReportsAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			int page = 1,
			int pageSize = 20);

		/// <summary>
		/// Get user's own reports
		/// </summary>
		Task<Result<PagedResponse<QuestionReportDto>>> GetMyReportsAsync(
			Guid userId,
			int page = 1,
			int pageSize = 20);

		/// <summary>
		/// Review/update a report (Admin/Test Creator only)
		/// </summary>
		Task<Result<QuestionReportDto>> ReviewReportAsync(
			int reportId,
			ReviewReportDto request,
			Guid reviewerId);

		/// <summary>
		/// Get pending reports count for dashboard
		/// </summary>
		Task<Result<int>> GetPendingReportsCountAsync();
	}
}
