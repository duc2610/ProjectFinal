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
		/// Admin can view all, TestCreator can only view reports for their tests
		/// </summary>
		Task<Result<QuestionReportDto>> GetReportByIdAsync(int reportId, Guid? requesterId = null, bool isAdmin = false);

		/// <summary>
		/// Get all reports with filtering (Admin/Test Creator only)
		/// Admin sees all reports, TestCreator only sees reports for their tests
		/// </summary>
		Task<Result<PagedResponse<QuestionReportDto>>> GetReportsAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			Guid? testCreatorId = null,
			bool isAdmin = false,
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
		/// Admin can review any report, TestCreator can only review reports for their tests
		/// </summary>
		Task<Result<QuestionReportDto>> ReviewReportAsync(
			int reportId,
			ReviewReportDto request,
			Guid reviewerId,
			bool isAdmin = false);

		/// <summary>
		/// Get pending reports count for dashboard
		/// Admin gets all pending, TestCreator gets only their pending reports
		/// </summary>
		Task<Result<int>> GetPendingReportsCountAsync(Guid? testCreatorId = null, bool isAdmin = false);
	}
}
