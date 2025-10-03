using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Question;

namespace ToeicGenius.Controllers
{
	[Route("api")]
	[ApiController]
	public class QuestionsController : ControllerBase
	{
		private readonly IQuestionService _questionService;
		private readonly IQuestionGroupService _questionGroupService;

		public QuestionsController(IQuestionService questionService, IQuestionGroupService questionGroupService)
		{
			_questionService = questionService;
			_questionGroupService = questionGroupService;
		}

		// POST: api/question
		[HttpPost("question")]
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
		public async Task<ActionResult<QuestionResponseDto>> GetQuestion(int id)
		{
			var question = await _questionService.GetQuestionResponseByIdAsync(id);
			if (question == null) return NotFound(ApiResponse<QuestionResponseDto>.NotFoundResponse());
			return Ok(ApiResponse<QuestionResponseDto>.SuccessResponse(question));
		}

		// PUT: api/question/{id}
		[HttpPut("question/{id}")]
		public async Task<IActionResult> UpdateQuestion(int id, [FromBody] UpdateQuestionDto dto)
		{
			if (id != dto.QuestionId)
				return BadRequest(ApiResponse<string>.ErrorResponse("Id not match"));
			var result = await _questionService.UpdateAsync(dto);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

		// DELETE: api/question/{id}
		[HttpDelete("question/{id}")]
		public async Task<IActionResult> DeleteQuestion(int id)
		{
			var result = await _questionService.DeleteAsync(id);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

		// GET: api/questions?part=&skill=&questionType=
		[HttpGet("questions")]
		public async Task<ActionResult<ApiResponse<PaginationResponse<QuestionResponseDto>>>> FilterQuestions(
			[FromQuery] int? part,
			[FromQuery] int? questionType,
			[FromQuery] int? skill,
			[FromQuery] int page = 1,
			[FromQuery] int pageSize = 10)
		{
			var result = await _questionService.FilterQuestionsAsync(part, questionType, skill, page, pageSize);
			if (!result.IsSuccess)
				return BadRequest(ApiResponse<PaginationResponse<QuestionResponseDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			return Ok(ApiResponse<PaginationResponse<QuestionResponseDto>>.SuccessResponse(result.Data!));
		}
	}
}
