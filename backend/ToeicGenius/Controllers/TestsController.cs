using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Drawing.Printing;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Exam;
using ToeicGenius.Domains.DTOs.Requests.Test;
using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.Test;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Controllers
{
	[Route("api/tests")]
	[ApiController]
	public class TestsController : ControllerBase
	{
		private readonly ITestService _testService;
		public TestsController(ITestService testService)
		{
			_testService = testService;
		}

		// Create from bank ( for practice test)
		[HttpPost("from-bank")]
		//[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateTestPractice([FromBody] CreateTestFromBankDto request)
		{
			var result = await _testService.CreateFromBankAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));
			}

			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		// Create test manual (for simulator test)
		[HttpPost("manual")]
		//[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateTestSimulator([FromBody] CreateTestManualDto request)
		{
			if (request == null)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse("Request cannot be null"));
			}

			try
			{
				var result = await _testService.CreateManualAsync(request);
				if (!result.IsSuccess)
					return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage ?? "Create test failed."));

				return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
			}
			catch (Exception ex)
			{
				return StatusCode(500, ApiResponse<string>.ErrorResponse("Internal server error:" + ex));
			}
		}

		// List test
		[HttpGet]
		//[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetTestsActive([FromQuery] TestFilterDto request)
		{
			var result = await _testService.FilterAllAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<PaginationResponse<TestListResponseDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			}
			return Ok(ApiResponse<PaginationResponse<TestListResponseDto>>.SuccessResponse(result.Data!));
		}

		[HttpGet("{id}")]
		//[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetTestDetail(int id)
		{
			var result = await _testService.GetDetailAsync(id);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<TestDetailDto>.ErrorResponse(result.ErrorMessage ?? "Error"));
			}
			return Ok(ApiResponse<TestDetailDto>.SuccessResponse(result.Data!));
		}

		[HttpPut("{id}")]
		//[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> UpdateTest(int id, [FromBody] UpdateTestDto request)
		{
			//var result = await _testService.UpdateAsync(id, request);
			//if (!result.IsSuccess)
			//{
			//	return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage ?? "Error"));
			//}
			return Ok(ApiResponse<string>.SuccessResponse(""));
		}

		[HttpPut("hide/{id}")]
		//[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> HideTest(int id)
		{
			var request = new UpdateTestStatusDto
			{
				TestId = id,
				Status = Domains.Enums.CommonStatus.Inactive
			};
			var result = await _testService.UpdateStatusAsync(request);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}

		[HttpPut("public/{id}")]
		//[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> PublicTest(int id)
		{
			var request = new UpdateTestStatusDto
			{
				TestId = id,
				Status = Domains.Enums.CommonStatus.Active
			};
			var result = await _testService.UpdateStatusAsync(request);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage));
			return Ok(ApiResponse<string>.SuccessResponse(result.Data));
		}
	}
}
