using System.Text.Json;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Report;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.Report;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Wrappers;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Services.Implementations
{
	public class QuestionReportService : IQuestionReportService
	{
		private readonly IUnitOfWork _uow;

		public QuestionReportService(IUnitOfWork unitOfWork)
		{
			_uow = unitOfWork;
		}

		public async Task<Result<QuestionReportDto>> CreateReportAsync(CreateQuestionReportDto request, Guid userId)
		{
			// Check if question exists
			var question = await _uow.TestQuestions.GetByIdAsync(request.TestQuestionId);
			if (question == null)
				return Result<QuestionReportDto>.Failure("Question not found");

			// Check if user has already reported this question
			var alreadyReported = await _uow.QuestionReports.HasUserReportedQuestionAsync(request.TestQuestionId, userId);
			if (alreadyReported)
				return Result<QuestionReportDto>.Failure("You have already reported this question");

			// Validate report type
			var validTypes = new[] { "IncorrectAnswer", "Typo", "AudioIssue", "ImageIssue", "Unclear", "Other" };
			if (!validTypes.Contains(request.ReportType))
				return Result<QuestionReportDto>.Failure("Invalid report type");

			// Create report
			var report = new QuestionReport
			{
				TestQuestionId = request.TestQuestionId,
				ReportedBy = userId,
				ReportType = request.ReportType,
				Description = request.Description,
				Status = ReportStatus.Pending,
				CreatedAt = Now
			};

			var created = await _uow.QuestionReports.CreateReportAsync(report);

			// Get full data for response
			var fullReport = await _uow.QuestionReports.GetReportByIdAsync(created.ReportId);
			if (fullReport == null)
				return Result<QuestionReportDto>.Failure("Failed to retrieve created report");

			var dto = MapToDto(fullReport);
			return Result<QuestionReportDto>.Success(dto);
		}

		public async Task<Result<QuestionReportDto>> GetReportByIdAsync(int reportId)
		{
			var report = await _uow.QuestionReports.GetReportByIdAsync(reportId);
			if (report == null)
				return Result<QuestionReportDto>.Failure("Report not found");

			var dto = MapToDto(report);
			return Result<QuestionReportDto>.Success(dto);
		}

		public async Task<Result<PagedResponse<QuestionReportDto>>> GetReportsAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			int page = 1,
			int pageSize = 20)
		{
			var skip = (page - 1) * pageSize;
			var reports = await _uow.QuestionReports.GetReportsAsync(status, testQuestionId, null, skip, pageSize);
			var totalCount = await _uow.QuestionReports.GetReportsCountAsync(status, testQuestionId, null);

			var dtos = reports.Select(MapToDto).ToList();
			var pagedResponse = new PagedResponse<QuestionReportDto>(dtos, page, pageSize, totalCount);

			return Result<PagedResponse<QuestionReportDto>>.Success(pagedResponse);
		}

		public async Task<Result<PagedResponse<QuestionReportDto>>> GetMyReportsAsync(
			Guid userId,
			int page = 1,
			int pageSize = 20)
		{
			var skip = (page - 1) * pageSize;
			var reports = await _uow.QuestionReports.GetReportsAsync(null, null, userId, skip, pageSize);
			var totalCount = await _uow.QuestionReports.GetReportsCountAsync(null, null, userId);

			var dtos = reports.Select(MapToDto).ToList();
			var pagedResponse = new PagedResponse<QuestionReportDto>(dtos, page, pageSize, totalCount);

			return Result<PagedResponse<QuestionReportDto>>.Success(pagedResponse);
		}

		public async Task<Result<QuestionReportDto>> ReviewReportAsync(
			int reportId,
			ReviewReportDto request,
			Guid reviewerId)
		{
			var report = await _uow.QuestionReports.GetReportByIdAsync(reportId);
			if (report == null)
				return Result<QuestionReportDto>.Failure("Report not found");

			// Validate status transition
			if (request.Status == ReportStatus.Pending)
				return Result<QuestionReportDto>.Failure("Cannot set status back to Pending");

			// Update report
			report.Status = request.Status;
			report.ReviewedBy = reviewerId;
			report.ReviewerNotes = request.ReviewerNotes;
			report.ReviewedAt = Now;

			await _uow.QuestionReports.UpdateReportAsync(report);

			// Get updated data
			var updated = await _uow.QuestionReports.GetReportByIdAsync(reportId);
			if (updated == null)
				return Result<QuestionReportDto>.Failure("Failed to retrieve updated report");

			var dto = MapToDto(updated);
			return Result<QuestionReportDto>.Success(dto);
		}

		public async Task<Result<int>> GetPendingReportsCountAsync()
		{
			var count = await _uow.QuestionReports.GetPendingReportsCountAsync();
			return Result<int>.Success(count);
		}

		private QuestionReportDto MapToDto(QuestionReport report)
		{
			// Deserialize SnapshotJson to get full question details
			QuestionSnapshotDto? snapshot = null;
			string? questionContent = null;

			if (!string.IsNullOrEmpty(report.TestQuestion?.SnapshotJson))
			{
				try
				{
					var options = new JsonSerializerOptions
					{
						PropertyNameCaseInsensitive = true
					};
					snapshot = JsonSerializer.Deserialize<QuestionSnapshotDto>(report.TestQuestion.SnapshotJson, options);
					questionContent = snapshot?.Content; // Lấy nội dung câu hỏi
				}
				catch (Exception ex)
				{
					// If deserialization fails, log error and try to show raw SnapshotJson
					Console.WriteLine($"Failed to deserialize SnapshotJson for TestQuestionId {report.TestQuestionId}: {ex.Message}");
					// Fallback: show part of SnapshotJson as questionContent
					questionContent = report.TestQuestion.SnapshotJson.Length > 200
						? report.TestQuestion.SnapshotJson.Substring(0, 200) + "..."
						: report.TestQuestion.SnapshotJson;
				}
			}

			return new QuestionReportDto
			{
				ReportId = report.ReportId,
				TestQuestionId = report.TestQuestionId,
				QuestionSnapshot = snapshot,
				QuestionContent = questionContent,
				PartId = report.TestQuestion?.PartId,
				PartName = report.TestQuestion?.Part?.Name,
				TestId = report.TestQuestion?.TestId,
				TestName = report.TestQuestion?.Test?.Title,
				SourceQuestionId = report.TestQuestion?.SourceQuestionId,
				SourceQuestionGroupId = report.TestQuestion?.SourceQuestionGroupId,
				ReportedBy = report.ReportedBy,
				ReporterName = report.Reporter?.FullName,
				ReporterEmail = report.Reporter?.Email,
				ReportType = report.ReportType,
				Description = report.Description,
				Status = report.Status,
				ReviewedBy = report.ReviewedBy,
				ReviewerName = report.Reviewer?.FullName,
				ReviewerNotes = report.ReviewerNotes,
				CreatedAt = report.CreatedAt,
				ReviewedAt = report.ReviewedAt
			};
		}
	}
}
