using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Drawing.Printing;
using System.Security.Claims;
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

		#region TEST CREATOR
		// Manage Test
		// Create from bank ( for practice test)
		[HttpPost("from-bank")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateTestPractice([FromBody] CreateTestFromBankDto request)
		{
			var result = await _testService.CreateFromBankAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));
			}

			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		// Create from bank with random selection ( for practice test - Speaking/Writing)
		[HttpPost("from-bank/random")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> CreateTestPracticeRandom([FromBody] CreateTestFromBankRandomDto request)
		{
			var result = await _testService.CreateFromBankRandomAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));
			}

			return Ok(ApiResponse<string>.SuccessResponse(result.Data!));
		}

		// Create test manual (for simulator test)
		[HttpPost("manual")]
		[Authorize(Roles = "TestCreator")]
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
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetTestsList([FromQuery] TestFilterDto request)
		{
			var result = await _testService.FilterAllAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<PaginationResponse<TestListResponseDto>>.ErrorResponse(result.ErrorMessage ?? "Error"));
			}
			return Ok(ApiResponse<PaginationResponse<TestListResponseDto>>.SuccessResponse(result.Data!));
		}

		[HttpGet("{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetTestDetail(int id)
		{
			var result = await _testService.GetDetailAsync(id);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<TestDetailDto>.ErrorResponse(result.ErrorMessage ?? "Error"));
			}
			return Ok(ApiResponse<TestDetailDto>.SuccessResponse(result.Data!));
		}

		[HttpPut("manual/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> UpdateManualTest(int id, [FromBody] UpdateManualTestDto dto)
		{
			var result = await _testService.UpdateManualTestAsync(id, dto);
			return result.IsSuccess ? Ok(result) : BadRequest(result);
		}

		[HttpPut("from-bank/{id}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> UpdateFromBankTest(int id, [FromBody] UpdateTestFromBank dto)
		{
			var result = await _testService.UpdateTestFromBankAsync(id, dto);
			return result.IsSuccess ? Ok(result) : BadRequest(result);
		}

		[HttpPut("hide/{id}")]
		[Authorize(Roles = "TestCreator")]
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
		[Authorize(Roles = "TestCreator")]
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

		[HttpGet("versions/{parentTestId}")]
		[Authorize(Roles = "TestCreator")]
		public async Task<IActionResult> GetVersions(int parentTestId)
		{
			var result = await _testService.GetVersionsByParentIdAsync(parentTestId);
			if (!result.IsSuccess)
				return NotFound(result.ErrorMessage);
			return Ok(result);
		}
		#endregion

		#region EXAMINEE
		// Examinee 
		// DO TEST
		[HttpGet("start")]
		[Authorize(Roles = "Examinee")]
		public async Task<IActionResult> GetTestStart([FromQuery] TestStartRequestDto request)
		{
			var result = await _testService.GetTestStartAsync(request);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<TestStartResponseDto>.ErrorResponse(result.ErrorMessage!));
			return Ok(ApiResponse<TestStartResponseDto>.SuccessResponse(result.Data!));
		}

		// Submit test
		[HttpPost("submit/L&R")]
		[Authorize(Roles = "Examinee")]
		public async Task<IActionResult> SubmitLRTest([FromBody] SubmitLRTestRequestDto request)
		{
			var result = await _testService.SubmitLRTestAsync(request);
			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));
			return Ok(ApiResponse<GeneralLRResultDto>.SuccessResponse(result.Data));
		}

		// Test history
		[HttpGet("history")]
		[Authorize(Roles = "Examinee")]
		public async Task<IActionResult> GetTestHistory()
		{
			var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
				return Unauthorized(ApiResponse<string>.ErrorResponse("Invalid or missing user ID."));

			var result = await _testService.GetTestHistoryAsync(userId);

			if (!result.IsSuccess)
				return NotFound(ApiResponse<string>.ErrorResponse(result.ErrorMessage!));

			return Ok(ApiResponse<List<TestHistoryDto>>.SuccessResponse(result.Data!));
		}

		#endregion

		//TODO: For examinee 
		// - Test History
		// - Test Result Detail
		// - Test list for Examinee
	}
}
