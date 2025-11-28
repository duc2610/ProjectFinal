using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Report;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Controllers
{
	[ApiController]
	[Route("api/question-reports")]
	public class QuestionReportsController : ControllerBase
	{
		private readonly IQuestionReportService _reportService;

		public QuestionReportsController(IQuestionReportService reportService)
		{
			_reportService = reportService;
		}

		/// <summary>
		/// User reports a question issue
		/// </summary>
		[HttpPost]
		[Authorize(Roles = "Examinee")]
		public async Task<IActionResult> CreateReport([FromBody] CreateQuestionReportDto request)
		{
			var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Invalid or missing user ID."));

			var result = await _reportService.CreateReportAsync(request, userId);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<object>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Get user's own reports
		/// </summary>
		[HttpGet("my-reports")]
		[Authorize(Roles = "Examinee")]
		public async Task<IActionResult> GetMyReports([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
		{
			var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Invalid or missing user ID."));

			var result = await _reportService.GetMyReportsAsync(userId, page, pageSize);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<object>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Get all reports with filtering (Admin/Test Creator only)
		/// Admin sees all reports, TestCreator only sees reports for their tests
		/// </summary>
		[HttpGet]
		[Authorize(Roles = "Admin,TestCreator")]
		public async Task<IActionResult> GetReports(
			[FromQuery] ReportStatus? status = null,
			[FromQuery] int? testQuestionId = null,
			[FromQuery] int page = 1,
			[FromQuery] int pageSize = 20)
		{
			var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Invalid or missing user ID."));

			var isAdmin = User.IsInRole("Admin");
			var result = await _reportService.GetReportsAsync(status, testQuestionId, userId, isAdmin, page, pageSize);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<object>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Get report by ID (Admin/Test Creator only)
		/// Admin can view any report, TestCreator can only view reports for their tests
		/// </summary>
		[HttpGet("{reportId}")]
		[Authorize(Roles = "Admin,TestCreator")]
		public async Task<IActionResult> GetReportById(int reportId)
		{
			var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Invalid or missing user ID."));

			var isAdmin = User.IsInRole("Admin");
			var result = await _reportService.GetReportByIdAsync(reportId, userId, isAdmin);

			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<object>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Review/update a report (Admin/Test Creator only)
		/// Admin can review any report, TestCreator can only review reports for their tests
		/// </summary>
		[HttpPut("{reportId}/review")]
		[Authorize(Roles = "Admin,TestCreator")]
		public async Task<IActionResult> ReviewReport(int reportId, [FromBody] ReviewReportDto request)
		{
			var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var reviewerId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Invalid or missing user ID."));

			var isAdmin = User.IsInRole("Admin");
			var result = await _reportService.ReviewReportAsync(reportId, request, reviewerId, isAdmin);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<object>.SuccessResponse(result.Data!));
		}

		/// <summary>
		/// Get pending reports count for dashboard (Admin/Test Creator only)
		/// Admin gets all pending count, TestCreator gets only their pending reports count
		/// </summary>
		[HttpGet("stats/pending-count")]
		[Authorize(Roles = "Admin,TestCreator")]
		public async Task<IActionResult> GetPendingCount()
		{
			var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Invalid or missing user ID."));

			var isAdmin = User.IsInRole("Admin");
			var result = await _reportService.GetPendingReportsCountAsync(userId, isAdmin);

			if (!result.IsSuccess)
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<int>.SuccessResponse(result.Data));
		}
	}
}
