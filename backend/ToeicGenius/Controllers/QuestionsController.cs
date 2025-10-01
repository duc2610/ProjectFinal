using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;

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
		public async Task<ActionResult<Question>> CreateQuestion([FromBody] Question question)
		{
			var created = await _questionService.CreateAsync(question);
			return CreatedAtAction(nameof(GetQuestion), new { id = created.QuestionId }, created);
		}

		// POST: api/question-group
		[HttpPost("question-group")]
		public async Task<ActionResult<QuestionGroup>> CreateQuestionGroup([FromBody] QuestionGroup group)
		{
			var created = await _questionGroupService.CreateAsync(group);
			return CreatedAtAction(nameof(GetQuestionGroup), new { id = created.QuestionGroupId }, created);
		}

		// GET: api/question/{id}
		[HttpGet("question/{id}")]
		public async Task<ActionResult<QuestionResponseDto>> GetQuestion(int id)
		{
			var question = await _questionService.GetQuestionResponseByIdAsync(id);
			if (question == null) return NotFound();
			return Ok(question);
		}

		// GET: api/question-group/{id}
		[HttpGet("question-group/{id}")]
		public async Task<ActionResult<QuestionGroupResponseDto>> GetQuestionGroup(int id)
		{
			var group = await _questionGroupService.GetQuestionGroupResponseByIdAsync(id);
			if (group == null) return NotFound();
			return Ok(group);
		}

		// PUT: api/question/{id}
		[HttpPut("question/{id}")]
		public async Task<IActionResult> UpdateQuestion(int id, [FromBody] Question question)
		{
			if (id != question.QuestionId) return BadRequest();
			var updated = await _questionService.UpdateAsync(question);
			if (updated == null) return NotFound();
			return NoContent();
		}

		// DELETE: api/question/{id}
		[HttpDelete("question/{id}")]
		public async Task<IActionResult> DeleteQuestion(int id)
		{
			return NoContent();
		}

		// GET: api/questions?part=3&tag=grammar
		[HttpGet("questions")]
		public async Task<ActionResult<IEnumerable<Question>>> FilterQuestions([FromQuery] int? part, [FromQuery] string tag)
		{
			return Ok();
		}
	}
}
