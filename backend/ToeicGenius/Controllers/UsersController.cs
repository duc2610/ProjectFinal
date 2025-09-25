using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.Auth;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Services.Interfaces;

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
			var user = await _userService.GetUserByIdAsync(id);
			return user == null ? NotFound(ApiResponse<UserResponseDto>.NotFoundResponse()) : Ok(user);
		}

		// Tạo user mới
		//[HttpPost]
		//[Authorize(Roles = "Admin")]
		//public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
		//{
		//	var user = await _userService.CreateUserAsync(dto);
		//	return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
		//}

		// Update user
		//[HttpPut("{id}")]
		//[Authorize(Roles = "Admin")]
		//public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
		//{
		//	var updated = await _userService.UpdateUserAsync(id, dto);
		//	return updated ? NoContent() : NotFound();
		//}
	}
}
