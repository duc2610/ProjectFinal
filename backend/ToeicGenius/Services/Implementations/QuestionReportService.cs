using System.Text.Json;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Report;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
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

			// Validate SubQuestionId for question groups
			if (question.IsQuestionGroup)
			{
				// For question groups, SubQuestionId is required
				if (!request.SubQuestionId.HasValue)
					return Result<QuestionReportDto>.Failure("SubQuestionId is required when reporting a question in a group");

				// Validate that SubQuestionId exists in the group
				if (!string.IsNullOrEmpty(question.SnapshotJson))
				{
					try
					{
						var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
						var groupSnapshot = JsonSerializer.Deserialize<QuestionGroupSnapshotDto>(question.SnapshotJson, options);
						var subQuestion = groupSnapshot?.QuestionSnapshots?.FirstOrDefault(q => q.QuestionId == request.SubQuestionId);
						if (subQuestion == null)
							return Result<QuestionReportDto>.Failure($"SubQuestionId {request.SubQuestionId} not found in question group");
					}
					catch
					{
						return Result<QuestionReportDto>.Failure("Failed to validate SubQuestionId");
					}
				}
			}

			// Check if user has already reported this question (with same SubQuestionId for groups)
			var alreadyReported = await _uow.QuestionReports.HasUserReportedQuestionAsync(request.TestQuestionId, userId, request.SubQuestionId);
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
				SubQuestionId = request.SubQuestionId,
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

		public async Task<Result<QuestionReportDto>> GetReportByIdAsync(int reportId, Guid? requesterId = null, bool isAdmin = false)
		{
			var report = await _uow.QuestionReports.GetReportByIdAsync(reportId);
			if (report == null)
				return Result<QuestionReportDto>.Failure("Report not found");

			// If not admin and requesterId provided, check if this report belongs to their test
			if (!isAdmin && requesterId.HasValue)
			{
				var isOwner = await _uow.QuestionReports.IsReportOwnedByCreatorAsync(reportId, requesterId.Value);
				if (!isOwner)
					return Result<QuestionReportDto>.Failure("You don't have permission to view this report");
			}

			var dto = MapToDto(report);
			return Result<QuestionReportDto>.Success(dto);
		}

		public async Task<Result<PagedResponse<QuestionReportDto>>> GetReportsAsync(
			ReportStatus? status = null,
			int? testQuestionId = null,
			Guid? testCreatorId = null,
			bool isAdmin = false,
			int page = 1,
			int pageSize = 20)
		{
			var skip = (page - 1) * pageSize;

			// Admin sees all reports, TestCreator only sees reports for their tests
			Guid? creatorFilter = isAdmin ? null : testCreatorId;

			var reports = await _uow.QuestionReports.GetReportsAsync(status, testQuestionId, null, creatorFilter, skip, pageSize);
			var totalCount = await _uow.QuestionReports.GetReportsCountAsync(status, testQuestionId, null, creatorFilter);

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
			var reports = await _uow.QuestionReports.GetReportsAsync(null, null, userId, null, skip, pageSize);
			var totalCount = await _uow.QuestionReports.GetReportsCountAsync(null, null, userId, null);

			var dtos = reports.Select(MapToDto).ToList();
			var pagedResponse = new PagedResponse<QuestionReportDto>(dtos, page, pageSize, totalCount);

			return Result<PagedResponse<QuestionReportDto>>.Success(pagedResponse);
		}

		public async Task<Result<QuestionReportDto>> ReviewReportAsync(
			int reportId,
			ReviewReportDto request,
			Guid reviewerId,
			bool isAdmin = false)
		{
			var report = await _uow.QuestionReports.GetReportByIdAsync(reportId);
			if (report == null)
				return Result<QuestionReportDto>.Failure("Report not found");

			// If not admin, check if this report belongs to their test
			if (!isAdmin)
			{
				var isOwner = await _uow.QuestionReports.IsReportOwnedByCreatorAsync(reportId, reviewerId);
				if (!isOwner)
					return Result<QuestionReportDto>.Failure("You don't have permission to review this report. Only the test creator or admin can review.");
			}

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

		public async Task<Result<int>> GetPendingReportsCountAsync(Guid? testCreatorId = null, bool isAdmin = false)
		{
			// Admin sees all pending reports, TestCreator sees only their pending reports
			Guid? creatorFilter = isAdmin ? null : testCreatorId;
			var count = await _uow.QuestionReports.GetPendingReportsCountAsync(creatorFilter);
			return Result<int>.Success(count);
		}

		private QuestionReportDto MapToDto(QuestionReport report)
		{
			// Deserialize SnapshotJson to get full question details
			QuestionSnapshotDto? questionSnapshot = null;
			QuestionGroupSnapshotDto? questionGroupSnapshot = null;
			QuestionSnapshotDto? reportedSubQuestion = null;
			string? questionContent = null;
			string? groupPassage = null;
			string? groupAudioUrl = null;
			string? groupImageUrl = null;
			int? groupQuestionCount = null;
			bool isQuestionGroup = report.TestQuestion?.IsQuestionGroup ?? false;

			if (!string.IsNullOrEmpty(report.TestQuestion?.SnapshotJson))
			{
				try
				{
					var options = new JsonSerializerOptions
					{
						PropertyNameCaseInsensitive = true
					};

					if (isQuestionGroup)
					{
						// Deserialize as QuestionGroupSnapshotDto
						questionGroupSnapshot = JsonSerializer.Deserialize<QuestionGroupSnapshotDto>(report.TestQuestion.SnapshotJson, options);

						// Extract group context info (for Creator to see full context)
						groupPassage = questionGroupSnapshot?.Passage;
						groupAudioUrl = questionGroupSnapshot?.AudioUrl;
						groupImageUrl = questionGroupSnapshot?.ImageUrl;
						groupQuestionCount = questionGroupSnapshot?.QuestionSnapshots?.Count;

						// Extract the specific sub-question that was reported
						if (report.SubQuestionId.HasValue && questionGroupSnapshot?.QuestionSnapshots != null)
						{
							reportedSubQuestion = questionGroupSnapshot.QuestionSnapshots
								.FirstOrDefault(q => q.QuestionId == report.SubQuestionId);
							// Use sub-question content as main content (for display in list)
							questionContent = reportedSubQuestion?.Content;
						}
						else
						{
							// Fallback: use Passage as content preview
							questionContent = questionGroupSnapshot?.Passage;
						}
					}
					else
					{
						// Deserialize as QuestionSnapshotDto
						questionSnapshot = JsonSerializer.Deserialize<QuestionSnapshotDto>(report.TestQuestion.SnapshotJson, options);
						questionContent = questionSnapshot?.Content;
					}
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
				IsQuestionGroup = isQuestionGroup,
				SubQuestionId = report.SubQuestionId,
				QuestionSnapshot = questionSnapshot,
				QuestionGroupSnapshot = questionGroupSnapshot,
				ReportedSubQuestion = reportedSubQuestion,
				GroupPassage = groupPassage,
				GroupAudioUrl = groupAudioUrl,
				GroupImageUrl = groupImageUrl,
				GroupQuestionCount = groupQuestionCount,
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
