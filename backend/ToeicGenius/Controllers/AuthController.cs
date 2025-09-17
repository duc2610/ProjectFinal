using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ToeicGenius.Domains.DTOs.Requests.Auth;
using ToeicGenius.Domains.DTOs.Responses.Auth;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly IAuthService _authService;
		public AuthController(IAuthService authService)
		{
			_authService = authService;
		}
		// Login
		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(ErrorMessages.InvalidRequest, 400));
			}

			try
			{
				var auth = await _authService.LoginAsync(loginDto);
				return Ok(ApiResponse<LoginResponseDto>.SuccessResponse(auth, SuccessMessages.UserLoggedIn));
			}
			catch (Exception ex)
			{
				var message = ex.Message == ErrorMessages.InvalidCredentials ? ErrorMessages.InvalidCredentials : ErrorMessages.OperationFailed;
				var status = ex.Message == ErrorMessages.InvalidCredentials ? 400 : 500;
				return StatusCode(status, ApiResponse<string>.ErrorResponse(message, status));
			}
		}


		// Register - Start
		// Request: send OTP
		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerDto)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(ErrorMessages.InvalidRequest, 400));
			}

			var message = await _authService.SendRegistrationOtpAsync(registerDto);
			if (string.IsNullOrEmpty(message))
			{
				return Ok(ApiResponse<string>.SuccessResponse(string.Empty, SuccessMessages.OperationSuccess));
			}
			return BadRequest(ApiResponse<string>.ErrorResponse(message, 400));
		}

		// Verify OTP & register
		[HttpPost("verify-register")]
		public async Task<IActionResult> VerifyRegister([FromBody] RegisterVerifyDto registerVerifyDto)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(ErrorMessages.InvalidRequest, 400));
			}

			var message = await _authService.VerifyRegistrationOtpAsync(registerVerifyDto);
			if (string.IsNullOrEmpty(message))
			{
				return Ok(ApiResponse<string>.SuccessResponse(string.Empty, SuccessMessages.UserRegistered));
			}
			return BadRequest(ApiResponse<string>.ErrorResponse(message, 400));
		}
		// Register - End

		// RESET PASSWORD - Start
		// Request reset pass: send OTP (first step)
		[HttpPost("request-reset-password")]
		public async Task<IActionResult> RequestResetPassword([FromBody] ResetPasswordRequestDto resetPasswordRequestDto)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(ErrorMessages.InvalidRequest, 400));
			}

			var message = await _authService.SendResetPasswordOtpAsync(resetPasswordRequestDto);
			if (string.IsNullOrEmpty(message))
			{
				return Ok(ApiResponse<string>.SuccessResponse(string.Empty, SuccessMessages.OperationSuccess));
			}
			var status = message == ErrorMessages.UserNotFound ? 404 : 400;
			return StatusCode(status, ApiResponse<string>.ErrorResponse(message, status));
		}

		[HttpGet("signin-google")]
		public async Task<IActionResult> GoogleLoginCallback([FromQuery] string code)
		{
			try
			{
				var (jwt, user) = await _authService.LoginWithGoogleAsync(code);
				var data = new { token = jwt, user };
				return Ok(ApiResponse<object>.SuccessResponse(data, SuccessMessages.UserLoggedIn));
			}
			catch (Exception ex)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse($"Google login failed: {ex.Message}", 400));
			}
		}


		// Verify OTP (second step)
		[HttpPost("verify-reset-otp")]
		public async Task<IActionResult> VerifyResetOtp([FromBody] ResetPasswordVerifyDto resetPasswordVerifyOtpDto)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(ErrorMessages.InvalidRequest, 400));
			}

			var message = await _authService.VerifyResetPasswordOtpAsync(resetPasswordVerifyOtpDto);
			if (string.IsNullOrEmpty(message))
			{
				return Ok(ApiResponse<string>.SuccessResponse(string.Empty, SuccessMessages.OperationSuccess));
			}
			return BadRequest(ApiResponse<string>.ErrorResponse(message, 400));
		}

		// Reset pass (final step)
		[HttpPost("reset-password")]
		public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordConfirmDto resetPasswordConfirmDto)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(ErrorMessages.InvalidRequest, 400));
			}

			var message = await _authService.ConfirmResetPasswordAsync(resetPasswordConfirmDto);
			if (string.IsNullOrEmpty(message))
			{
				return Ok(ApiResponse<string>.SuccessResponse(string.Empty, SuccessMessages.PasswordChanged));
			}
			return BadRequest(ApiResponse<string>.ErrorResponse(message, 400));
		}
		// RESET PASSWORD - End

		// Profile
		[HttpGet("profile")]
		[Authorize]
		public async Task<IActionResult> GetProfile()
		{
			var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

			if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
			{
				return Unauthorized(ApiResponse<string>.UnauthorizedResponse(ErrorMessages.Unauthorized));
			}

			var user = await _authService.GetUserByIdAsync(userId);

			if (user == null)
			{
				return NotFound(ApiResponse<string>.NotFoundResponse(ErrorMessages.UserNotFound));
			}

			var userDto = new { UserId = user.Id, Email = user.Email, FullName = user.FullName };
			return Ok(ApiResponse<object>.SuccessResponse(userDto, SuccessMessages.OperationSuccess));
		}

		// Change password
		[HttpPost("change-password")]
		[Authorize]
		public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordRequest)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(ApiResponse<string>.ErrorResponse(ErrorMessages.InvalidRequest, 400));
			}

			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized(ApiResponse<string>.UnauthorizedResponse(ErrorMessages.TokenInvalid));

			var message = await _authService.ChangePasswordAsync(changePasswordRequest, userId);
			if (string.IsNullOrEmpty(message))
			{
				return Ok(ApiResponse<string>.SuccessResponse(string.Empty, SuccessMessages.PasswordChanged));
			}
			return BadRequest(ApiResponse<string>.ErrorResponse(message, 400));
		}
	}
}
