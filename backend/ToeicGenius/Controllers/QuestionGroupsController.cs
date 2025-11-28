using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.DTOs.Requests.QuestionGroup;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Controllers
{
	[Route("api")]
	[ApiController]
	public class QuestionGroupsController : ControllerBase
	{
		private readonly IQuestionGroupService _questionGroupService;

		public QuestionGroupsController(IQuestionGroupService questionGroupService)
		{
			_questionGroupService = questionGroupService;
		}

		// POST: api/question-group
		[HttpPost("question-group")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateQuestionGroup([FromForm] QuestionGroupRequestDto request)
		{
			var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Unauthorized"));

			// Deserialize JSON string sang danh sách object
			try
			{
				request.Questions = JsonConvert.DeserializeObject<List<CreateQuestionDto>>(request.QuestionsJson)
									?? new List<CreateQuestionDto>();
			}
			catch (Exception ex)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse($"Invalid Questions JSON: {ex.Message}"));
			}
			var result = await _questionGroupService.CreateAsync(request, userId);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<QuestionGroupResponseDto>.ErrorResponse(result.ErrorMessage ?? "Create failed"));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		// GET: api/question-group/{id} - TestCreator only sees their own question groups
		[HttpGet("question-group/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetQuestionGroup(int id)
		{
			var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
				return Unauthorized(ApiResponse<QuestionGroupResponseDto>.ErrorResponse("Unauthorized"));

			var isAdmin = User.IsInRole("Admin");
			var result = await _questionGroupService.GetDetailAsync(id, userId, isAdmin);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<QuestionGroupResponseDto>.ErrorResponse(result.ErrorMessage));
			}
			if (result.Data == null) return NotFound(ApiResponse<QuestionGroupResponseDto>.NotFoundResponse());
			return Ok(ApiResponse<QuestionGroupResponseDto>.SuccessResponse(result.Data));
		}

		// GET: api/question-group?part=&page=&pageSize= - TestCreator only sees their own question groups
		[HttpGet("question-group")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> FilterGroupQuestions(
			[FromQuery] int? part,
			[FromQuery] string? keyWord,
			[FromQuery] int? skill,
			[FromQuery] string sortOrder = "desc",
			[FromQuery] int page = NumberConstants.DefaultFirstPage,
			[FromQuery] int pageSize = NumberConstants.DefaultPageSize)
		{
			var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
				return Unauthorized(ApiResponse<PaginationResponse<QuestionListItemDto>>.ErrorResponse("Unauthorized"));

			var result = await _questionGroupService.FilterQuestionGroupAsync(part, keyWord, skill, sortOrder, page, pageSize, Domains.Enums.CommonStatus.Active, userId);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<PaginationResponse<QuestionListItemDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			return Ok(ApiResponse<PaginationResponse<QuestionListItemDto>>.SuccessResponse(result.Data!));
		}

		// GET: api/question-group/deleted?part=&page=&pageSize= - TestCreator only sees their own deleted question groups
		[HttpGet("question-group/deleted")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> FilterGroupQuestionsDeleted(
			[FromQuery] int? part,
			[FromQuery] string? keyWord,
			[FromQuery] int? skill,
			[FromQuery] string sortOrder = "desc",
			[FromQuery] int page = NumberConstants.DefaultFirstPage,
			[FromQuery] int pageSize = NumberConstants.DefaultPageSize)
		{
			var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
				return Unauthorized(ApiResponse<PaginationResponse<QuestionListItemDto>>.ErrorResponse("Unauthorized"));

			var result = await _questionGroupService.FilterQuestionGroupAsync(part, keyWord, skill, sortOrder, page, pageSize, Domains.Enums.CommonStatus.Inactive, userId);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<PaginationResponse<QuestionListItemDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			return Ok(ApiResponse<PaginationResponse<QuestionListItemDto>>.SuccessResponse(result.Data!));
		}

		// PUT: api/question-group/{id}
		[HttpPut("question-group/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> UpdateQuestion(int id, [FromForm] UpdateQuestionGroupDto request)
		{
			var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Unauthorized"));

			var isAdmin = User.IsInRole("Admin");

			// Deserialize JSON string sang danh sách object
			try
			{
				request.Questions = JsonConvert.DeserializeObject<List<UpdateSingleQuestionDto>>(request.QuestionsJson)
									?? new List<UpdateSingleQuestionDto>();
			}
			catch (Exception ex)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse($"Invalid Questions JSON: {ex.Message}"));
			}
			var result = await _questionGroupService.UpdateAsync(id, request, userId, isAdmin);
			if (!result.IsSuccess)
			{
				if (result.ErrorMessage?.Contains("Not found", StringComparison.OrdinalIgnoreCase) == true)
				{
					return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
				}
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			}
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}
	}
}
