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

		[HttpGet("by-test-skill/{testSkill}")]
		public async Task<IActionResult> GetPartsByTestSkill(TestSkill testSkill)
		{
			if (!Enum.IsDefined(typeof(TestSkill), testSkill))
			{
				return BadRequest("Invalid Test Skill.");
			}

			var result = await _uow.Parts.GetPartsByTestSkill(testSkill);

			return Ok(ApiResponse<List<Part>>.SuccessResponse(result));
		}
	}
}
