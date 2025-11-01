using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;

namespace ToeicGenius.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class QuestionTypesController : ControllerBase
	{
		private readonly IUnitOfWork _uow;

		public QuestionTypesController(IUnitOfWork uow)
		{
			_uow = uow;
		}

		[HttpGet("by-part/{partId}")]
		public async Task<IActionResult> GetPartsByTestSkill(int partId)
		{
			var result = await _uow.QuestionTypes.GetQuestionTypeByTestSkill(partId);
			return Ok(ApiResponse<List<QuestionType>>.SuccessResponse(result));
		}
	}
}
