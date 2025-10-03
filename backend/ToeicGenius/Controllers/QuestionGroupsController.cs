using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.GroupQuestion;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;

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
		public async Task<ActionResult<ApiResponse<QuestionGroupResponseDto>>> CreateQuestionGroup([FromBody] QuestionGroupRequestDto request)
		{
			var result = await _questionGroupService.CreateQuestionGroupAsync(request);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<QuestionGroupResponseDto>.ErrorResponse(result.ErrorMessage ?? "Create failed"));
			return Ok(ApiResponse<QuestionGroupResponseDto>.SuccessResponse(result.Data!));
		}

		// GET: api/question-group/{id} -> DONE 
		[HttpGet("question-group/{id}")]
		public async Task<ActionResult<QuestionGroupResponseDto>> GetQuestionGroup(int id)
		{
			var group = await _questionGroupService.GetQuestionGroupResponseByIdAsync(id);
			if (group == null) return NotFound(ApiResponse<QuestionGroupResponseDto>.NotFoundResponse());
			return Ok(ApiResponse<QuestionGroupResponseDto>.SuccessResponse(group));
		}

		// GET: api/question-group?part=&skill=&Type=
		[HttpGet("question-group")]
		public async Task<ActionResult<ApiResponse<IEnumerable<QuestionGroupListItemDto>>>> FilterGroupQuestions(
			[FromQuery] int? part, [FromQuery] string? tag)
		{
			var groups = await _questionGroupService.FilterGroupsAsync(part);
			return Ok(ApiResponse<IEnumerable<QuestionGroupListItemDto>>.SuccessResponse(groups));
		}

		// PUT: api/question-group/{id}
		[HttpPut("question-group/{id}")]
		public async Task<IActionResult> UpdateQuestion(int id, [FromBody] Question question)
		{
			return NoContent();
		}

		// DELETE: api/question-group/{id}
		[HttpDelete("question-group/{id}")]
		public async Task<IActionResult> DeleteGroupQuestion(int id)
		{
			return NoContent();
		}

	}
}
