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

		[HttpPost("from-bank")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateTestPractice([FromForm] CreateTestFromBankDto request)
		{
			var result = await _testService.CreateTestFromBankAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));
			}

			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		[HttpPost("manual")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateTestSimulator([FromForm] CreateTestManualDto request)
		{
			var result = await _testService.CreateTestManualAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));
			}

			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		[HttpPut("status")]
		[Authorize(Roles ="TestCreator")]
		public async Task<IActionResult> UpdateStatus([FromBody] UpdateTestStatusDto request)
		{
			var result = await _testService.UpdateTestStatusAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));
			}

			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		[HttpGet]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetTests([FromQuery] TestFilterDto request)
		{
			var result = await _testService.FilterTestAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<PaginationResponse<TestListResponseDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			}
			return Ok(ApiResponse<PaginationResponse<TestListResponseDto>>.SuccessResponse(result.Data!));
		}

		[HttpGet("{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetTests(int id)
		{
			var result = await _testService.GetTestDetailAsync(id);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<TestDetailDto>.ErrorResponse(result.ErrorMessage ?? "Error"));
			}
			return Ok(ApiResponse<TestDetailDto>.SuccessResponse(result.Data!));
		}
	}
}
