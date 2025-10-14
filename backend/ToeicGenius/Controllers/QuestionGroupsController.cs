using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
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
		public async Task<IActionResult> CreateQuestionGroup([FromForm] QuestionGroupRequestDto request)
		{
			var result = await _questionGroupService.CreateQuestionGroupAsync(request);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<QuestionGroupResponseDto>.ErrorResponse(result.ErrorMessage ?? "Create failed"));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		// GET: api/question-group/{id} -> DONE 
		[HttpGet("question-group/{id}")]
		public async Task<IActionResult> GetQuestionGroup(int id)
		{
			var group = await _questionGroupService.GetQuestionGroupResponseByIdAsync(id);
			if (group == null) return NotFound(ApiResponse<QuestionGroupResponseDto>.NotFoundResponse());
			return Ok(ApiResponse<QuestionGroupResponseDto>.SuccessResponse(group));
		}

		// GET: api/question-group?part=&skill=&Type=
		[HttpGet("question-group")]
		public async Task<IActionResult> FilterGroupQuestions(
			[FromQuery] int? part,
			[FromQuery] int page,
			[FromQuery] int pageSize)
		{
			var result = await _questionGroupService.FilterGroupsAsync(part, page, pageSize);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<PaginationResponse<QuestionGroupListItemDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			return Ok(ApiResponse<PaginationResponse<QuestionGroupListItemDto>>.SuccessResponse(result.Data!));
		}

		// PUT: api/question-group/{id}
		[HttpPut("question-group/{id}")]
		public async Task<IActionResult> UpdateQuestion(int id, [FromForm] UpdateQuestionGroupDto request)
		{
			var result = await _questionGroupService.UpdateAsync(id, request);
			if (!result.IsSuccess) return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

		// DELETE: api/question-group/{id}
		[HttpDelete("question-group/{id}")]
		public async Task<IActionResult> DeleteGroupQuestion(int id)
		{
			var result = await _questionGroupService.DeleteQuestionGroupAsync(id);
			if (!result.IsSuccess) return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

	}
}
