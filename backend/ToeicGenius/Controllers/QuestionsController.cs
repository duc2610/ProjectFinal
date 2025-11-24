using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Question;
using Microsoft.AspNetCore.Authorization;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Controllers
{
	[Route("api")]
	[ApiController]
	public class QuestionsController : ControllerBase
	{
		private readonly IQuestionService _questionService;

		public QuestionsController(IQuestionService questionService)
		{
			_questionService = questionService;
		}

		// POST: api/question
		[HttpPost("question")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateQuestion([FromForm] CreateQuestionDto request)
		{
			var result = await _questionService.CreateAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			}
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

		// GET: api/question/{id}
		[HttpGet("question/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<ActionResult<QuestionResponseDto>> GetQuestion(int id)
		{
			var question = await _questionService.GetQuestionResponseByIdAsync(id);
			if (question == null) return NotFound(ApiResponse<QuestionResponseDto>.NotFoundResponse());
			return Ok(ApiResponse<QuestionResponseDto>.SuccessResponse(question));
		}

		// PUT: api/question/{id}
		[HttpPut("question/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> UpdateQuestion(int id, [FromForm] UpdateQuestionDto dto)
		{
			var result = await _questionService.UpdateAsync(id, dto);
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

		// DELETE: api/question/{id}
		[HttpDelete("question/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> DeleteQuestion(int id, [FromQuery] bool isGroupQuestion)
		{
			bool isRestore = false;
			var result = await _questionService.UpdateStatusAsync(id, isGroupQuestion, isRestore);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

		// RESTORE: api/question/restore/{id}
		[HttpPut("question/restore/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> RestoreQuestion(int id, [FromQuery] bool isGroupQuestion)
		{
			bool isRestore = true;
			var result = await _questionService.UpdateStatusAsync(id, isGroupQuestion, isRestore);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

		// Get list: single question
		[HttpGet("questions")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> FilterQuestions(
			[FromQuery] int? part,
			[FromQuery] int? questionType,
			[FromQuery] int? skill,
			[FromQuery] string? keyWord,
			[FromQuery] string sortOrder = "desc",
			[FromQuery] int page = NumberConstants.DefaultFirstPage,
			[FromQuery] int pageSize = NumberConstants.DefaultPageSize)
		{
			var result = await _questionService.FilterSingleQuestionAsync(part, questionType, keyWord, skill, sortOrder, page, pageSize, Domains.Enums.CommonStatus.Active);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<PaginationResponse<QuestionListItemDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			return Ok(ApiResponse<PaginationResponse<QuestionListItemDto>>.SuccessResponse(result.Data!));
		}

		// GET: api/questions?part=&skill=&questionType=
		[HttpGet("questions/deleted")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> FilterQuestionsDeleted(
			[FromQuery] int? part,
			[FromQuery] int? questionType,
			[FromQuery] int? skill,
			[FromQuery] string? keyWord,
			[FromQuery] string sortOrder = "desc",
			[FromQuery] int page = NumberConstants.DefaultFirstPage,
			[FromQuery] int pageSize = NumberConstants.DefaultPageSize)
		{
			var result = await _questionService.FilterSingleQuestionAsync(part, questionType, keyWord, skill, sortOrder, page, pageSize, Domains.Enums.CommonStatus.Inactive);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<PaginationResponse<QuestionListItemDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			return Ok(ApiResponse<PaginationResponse<QuestionListItemDto>>.SuccessResponse(result.Data!));
		}
	}
}
