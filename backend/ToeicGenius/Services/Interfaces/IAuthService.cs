using static Google.Apis.Auth.OAuth2.Web.AuthorizationCodeWebApp;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.DTOs.Requests.Auth;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Responses.Auth;

namespace ToeicGenius.Services.Interfaces
{
	public interface IAuthService
	{
		/// <summary>
		/// Authenticate a user with email and password.
		/// </summary>
		/// <param name="loginDto">Login request data containing email and password.</param>
    	/// <returns>Authentication result including JWT token if successful.</returns>
		Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto loginDto, string ipAddress);
		Task<Result<string>> LogoutAsync(Guid userId, string refreshToken, string ipAddress);

		// Send OTP code to email for registration verification.	
		Task<string> SendRegistrationOtpAsync(RegisterRequestDto registerRequestDto);

		// Verify OTP and complete user registration.
		Task<string> VerifyRegistrationOtpAsync(RegisterVerifyDto registerDto);

		// Send OTP code to email for password reset.
		Task<string> SendResetPasswordOtpAsync(ResetPasswordRequestDto resetPasswordRequestDto);

		// Verify OTP code sent for password reset.
		Task<string> VerifyResetPasswordOtpAsync(ResetPasswordVerifyDto resetPasswordVerifyOtpDto);

		// Confirm new password after OTP verification.
		Task<string> ConfirmResetPasswordAsync(ResetPasswordConfirmDto resetPasswordConfirmDto);

		// Change password for a logged-in user.
		Task<string> ChangePasswordAsync(ChangePasswordDto changePasswordRequest, string userId);

		/// <summary>
		/// Authenticate user using Google OAuth2 authorization code.
		/// </summary>
		/// <param name="code">Google authorization code from client.</param>
		/// <returns>Tuple of JWT token and User entity if successful.</returns>
		Task<LoginResponseDto> LoginWithGoogleAsync(string code, string ipAddress);

		Task<Result<RefreshTokenResponseDto>> RefreshTokenAsync(string refreshToken, string ipAddress);


	}
}
