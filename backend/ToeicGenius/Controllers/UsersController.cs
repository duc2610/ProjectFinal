using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.Auth;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class UsersController : ControllerBase
	{
		private readonly IUserService _userService;
		public UsersController(IUserService userService)
		{
			_userService = userService;
		}
		// Lấy danh sách user
		[HttpGet]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> GetUsers([FromQuery] UserResquestDto request)
		{
			var result = await _userService.GetUsersAsync(request);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<PaginationResponse<UserResponseDto>>.ErrorResponse(result.ErrorMessage!));
			}
			return Ok(ApiResponse<PaginationResponse<UserResponseDto>>.SuccessResponse(result.Data!));
		}

		// Lấy chi tiết user
		[HttpGet("{id}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> GetUserById(Guid id)
		{
			var result = await _userService.GetUserByIdAsync(id);
			if (!result.IsSuccess)
			{
				return NotFound(ApiResponse<UserResponseDto>.NotFoundResponse(result.ErrorMessage));
			}
			return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result.Data));
		}

		// Tạo user mới
		[HttpPost]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
		{
			var result = await _userService.CreateUserAsync(dto);
			if (!result.IsSuccess)
			{
				return BadRequest(ApiResponse<UserResponseDto>.ErrorResponse(result.ErrorMessage!));
			}
			return CreatedAtAction(nameof(GetUserById), new { id = result.Data!.Id }, ApiResponse<UserResponseDto>.SuccessResponse(result.Data, SuccessMessages.OperationSuccess, 201));
		}

		// Update user
		[HttpPut("{id}")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
		{
			var result = await _userService.UpdateUserAsync(id, dto);
			if (!result.IsSuccess)
			{
				return NotFound(ApiResponse<UserResponseDto>.NotFoundResponse(result.ErrorMessage!));
			}
			return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result.Data!, SuccessMessages.UserProfileUpdated));
		}

		// Ban user
		[HttpPut("{id}/ban")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> BanUser(Guid id)
		{
			var result = await _userService.UpdateStatus(id, UserStatus.Banned);
			if (!result.IsSuccess)
			{
				return NotFound(ApiResponse<string>.NotFoundResponse(result.ErrorMessage!));
			}
			return Ok(ApiResponse<string>.SuccessResponse(result.Data!, SuccessMessages.UserStatusUpdated));
		}

		// Unban user
		[HttpPut("{id}/unban")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> UnbanUser(Guid id)
		{
			var result = await _userService.UpdateStatus(id, UserStatus.Active);
			if (!result.IsSuccess)
			{
				return NotFound(ApiResponse<string>.NotFoundResponse(result.ErrorMessage!));
			}
			return Ok(ApiResponse<string>.SuccessResponse(result.Data!, SuccessMessages.UserStatusUpdated));
		}
	}
}
