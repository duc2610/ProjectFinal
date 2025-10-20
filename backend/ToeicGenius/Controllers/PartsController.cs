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
	public class PartsController : ControllerBase
	{
		private readonly IUnitOfWork _uow;

		public PartsController(IUnitOfWork uow)
		{
			_uow = uow;
		}

		[HttpGet("by-skill/{questionSkill}")]
		public async Task<IActionResult> GetPartsByTestSkill(QuestionSkill questionSkill)
		{
			if (!Enum.IsDefined(typeof(QuestionSkill), questionSkill))
			{
				return BadRequest("Invalid question skill.");
			}

			var result = await _uow.Parts.GetPartsBySkill(questionSkill);

			return Ok(ApiResponse<List<Part>>.SuccessResponse(result));
		}
	}
}
