using Google.Apis.Auth.OAuth2.Web;
using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Auth;
using ToeicGenius.Domains.DTOs.Responses.Auth;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Helpers;
using static Google.Apis.Auth.OAuth2.Web.AuthorizationCodeWebApp;

namespace ToeicGenius.Services.Implementations
{
	public class AuthService : IAuthService
	{
		private readonly IConfiguration _configuration;
		private readonly IJwtService _jwtService;
		private readonly IEmailService _emailService;
		private readonly IUserOtpRepository _userOtpRepository;
		private readonly IUserRepository _userRepository;
		private readonly HttpClient _httpClient;
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly IGoogleAuthService _googleAuthService;
		

		public AuthService(
			IConfiguration configuration,
			IJwtService jwtService,
			IEmailService emailService,
			IUserOtpRepository userOtpRepository,
			IUserRepository userRepository,
			IHttpClientFactory httpClientFactory,
			IGoogleAuthService googleAuthService)
		{
			_configuration = configuration;
			_jwtService = jwtService;
			_emailService = emailService;
			_userOtpRepository = userOtpRepository;
			_userRepository = userRepository;
			_httpClientFactory = httpClientFactory;
			_googleAuthService = googleAuthService;

			// Khởi tạo HttpClient từ IHttpClientFactory
			_httpClient = _httpClientFactory.CreateClient();
		}

		public async Task<string> ChangePasswordAsync(ChangePasswordDto changePasswordRequest, string userId)
		{
			// Parse userId
			if (!Guid.TryParse(userId, out Guid guidUserId))
				return ErrorMessages.IdInvalid;

			// Tìm user theo Id
			var user = await _userRepository.GetByIdAsync(guidUserId);
			if (user == null)
				return ErrorMessages.UserNotFound;

			if (string.IsNullOrEmpty(user.PasswordHash))
			{
				// Trường hợp user chưa từng có mật khẩu (login Google lần đầu)
				// Không cần verify old password
				user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordRequest.NewPassword);
				user.UpdatedAt = DateTime.UtcNow;

				await _userRepository.UpdateAsync(user);
				await _userRepository.SaveChangesAsync();

				return "";
			}

			// Verify mật khẩu cũ
			if (!SecurityHelper.VerifyPassword(changePasswordRequest.OldPassword, user.PasswordHash))
				return ErrorMessages.OldPasswordMismatch;

			// Hash mật khẩu mới
			user.PasswordHash = SecurityHelper.HashPassword(changePasswordRequest.NewPassword);
			user.UpdatedAt = DateTime.UtcNow;

			// Update pass
			await _userRepository.UpdateAsync(user);
			await _userRepository.SaveChangesAsync();

			return "";
		}


		public async Task<string> ConfirmResetPasswordAsync(ResetPasswordConfirmDto resetPasswordConfirmDto)
		{
			try
			{
				// Tìm user theo email và đang active
				var user = await _userRepository.GetByEmailAsync(resetPasswordConfirmDto.Email);

				if (user == null)
				{
					return ErrorMessages.UserNotFound;
				}

				// Hash mật khẩu mới
				user.PasswordHash = SecurityHelper.HashPassword(resetPasswordConfirmDto.NewPassword);
				user.UpdatedAt = DateTime.UtcNow;

				// Cập nhật DB
				await _userRepository.UpdateAsync(user);
				await _userRepository.SaveChangesAsync();

				return "";
			}
			catch (Exception)
			{
				return ErrorMessages.OperationFailed;
			}
		}


		public async Task<User?> GetUserByIdAsync(Guid userId)
		{
			return await _userRepository.GetByIdAsync(userId);
		}

		public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto loginDto, string ipAddress)
		{
			var user = await _userRepository.GetByEmailAsync(loginDto.Email);

			if (user == null || !user.IsActive || user.PasswordHash == null)
				return Result<LoginResponseDto>.Failure(ErrorMessages.InvalidCredentials);

			if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
				return Result<LoginResponseDto>.Failure(ErrorMessages.InvalidCredentials);

			var token = _jwtService.GenerateAccessToken(user);
			var refreshToken = _jwtService.GenerateRefreshToken(ipAddress);
			user.RefreshTokens.Add(refreshToken);
			await _userRepository.UpdateAsync(user);
			await _userRepository.SaveChangesAsync();
			var response = new LoginResponseDto
			{
				Token = token,
				RefreshToken = refreshToken.Token,
				Fullname = user.FullName,
				UserId = user.Id
			};

			return Result<LoginResponseDto>.Success(response);
		}


		public async Task<(string jwtToken, User user)> LoginWithGoogleAsync(string code)
		{
			// 1. Exchange code for tokens
			var (idToken, accessToken) = await _googleAuthService.ExchangeCodeForTokensAsync(code);

			// 2. Validate id_token
			var payload = await _googleAuthService.ValidateIdTokenAsync(idToken);

			// 3. Check user in DB
			var user = await _userRepository.GetByEmailAsync(payload.Email);
			if (user == null)
			{
				user = new User
				{
					Id = Guid.NewGuid(),
					Email = payload.Email,
					FullName = payload.Name ?? "",
					GoogleId = payload.Subject
				};
				await _userRepository.AddAsync(user);
			}

			// 4. Generate JWT
			var jwt = _jwtService.GenerateAccessToken(user);

			return (jwt, user);
		}

		public async Task<string> SendRegistrationOtpAsync(RegisterRequestDto registerRequestDto)
		{
			try
			{
				var existingUser = await _userRepository.GetByEmailAsync(registerRequestDto.Email);
				if (existingUser != null)
				{
					return ErrorMessages.EmailAlreadyExists;
				}

				var otpCode = await GenerateAndStoreOtpAsync(registerRequestDto.Email,(int)OtpType.Registration);
				await SendOtpByEmailAsync(registerRequestDto.Email, otpCode, "OTP Đăng ký");

				return "";
			}
			catch (Exception)
			{
				return ErrorMessages.OperationFailed;
			}
		}

		public async Task<string> SendResetPasswordOtpAsync(ResetPasswordRequestDto resetPasswordRequestDto)
		{
			try
			{
				var user = await _userRepository.GetByEmailAsync(resetPasswordRequestDto.Email);
				if (user == null || !user.IsActive)
				{
					return ErrorMessages.UserNotFound;
				}

				var otpCode = await GenerateAndStoreOtpAsync(resetPasswordRequestDto.Email, (int)OtpType.ResetPassword);
				await SendOtpByEmailAsync(resetPasswordRequestDto.Email, otpCode, "OTP Đổi mật khẩu");

				return "";
			}
			catch (Exception)
			{
				return ErrorMessages.OperationFailed;
			}
		}

		public async Task<string> VerifyRegistrationOtpAsync(RegisterVerifyDto registerDto)
		{
			try
			{
				var valid = await ValidateOtpAsync(registerDto.Email, registerDto.OtpCode, (int)OtpType.Registration);
				if (!valid)
				{
					return ErrorMessages.OtpInvalid;
				}

				var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
				if (existingUser != null)
				{
					return ErrorMessages.EmailAlreadyExists;
				}

				var user = new User
				{
					Email = registerDto.Email,
					FullName = registerDto.FullName,
					PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
					CreatedAt = DateTime.UtcNow,
					IsActive = true
				};

				await _userRepository.AddAsync(user);
				await _userRepository.SaveChangesAsync();

				await MarkOtpAsUsedAsync(registerDto.Email, (int)OtpType.Registration);
				return "";
			}
			catch (Exception)
			{
				return ErrorMessages.OperationFailed;
			}
		}

		public async Task<string> VerifyResetPasswordOtpAsync(ResetPasswordVerifyDto resetPasswordVerifyOtpDto)
		{
			var valid = await ValidateOtpAsync(resetPasswordVerifyOtpDto.Email, resetPasswordVerifyOtpDto.OtpCode, (int)OtpType.ResetPassword);
			if (!valid)
			{
				return ErrorMessages.OtpInvalid;
			}
			await MarkOtpAsUsedAsync(resetPasswordVerifyOtpDto.Email, (int)OtpType.ResetPassword);
			return "";
		}

		private async Task<string> GenerateAndStoreOtpAsync(string email, int type)
		{
			var otp = SecurityHelper.GenerateOtp();
			var hashed = SecurityHelper.HashOtp(otp);
			var entity = new UserOtp
			{
				Id = Guid.NewGuid(),
				Email = email,
				OtpCodeHash = hashed,
				Type = type,
				CreatedAt = DateTime.UtcNow,
				ExpiresAt = DateTime.UtcNow.AddMinutes(10)
			};
			await _userOtpRepository.AddAsync(entity);
			await _userOtpRepository.SaveChangesAsync();
			return otp;
		}

		private async Task<bool> ValidateOtpAsync(string email, string otpCode, int type)
		{
			var record = await _userOtpRepository.GetOtpByEmailAsync(email, type);
			if (record == null || record.UsedAt != null) return false;
			return SecurityHelper.ValidateOtp(otpCode, record.OtpCodeHash, record.ExpiresAt);
		}

		private async Task MarkOtpAsUsedAsync(string email, int type)
		{
			var record = await _userOtpRepository.GetOtpByEmailAsync(email, type);
			if (record != null)
			{
				record.UsedAt = DateTime.UtcNow;
				await _userOtpRepository.UpdateAsync(record);
				await _userOtpRepository.SaveChangesAsync();
			}
		}

		private async Task SendOtpByEmailAsync(string email, string otpCode, string subject)
		{
			var body = $"Mã OTP của bạn là: {otpCode}. Mã có hiệu lực trong 10 phút.";
			await _emailService.SendMail(email, subject, body);
		}

		public async Task<Result<RefreshTokenResponseDto>> RefreshTokenAsync(string refreshToken, string ipAddress)
		{
			// Tìm user theo refresh token
			var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);
			if (user == null)
				return Result<RefreshTokenResponseDto>.Failure("Invalid refresh token");

			var existingToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);
			if (existingToken == null || existingToken.ExpiresAt <= DateTime.UtcNow || existingToken.RevokeAt != null)
				return Result<RefreshTokenResponseDto>.Failure("Refresh token expired or revoked");

			// Revoke token cũ
			existingToken.RevokeAt = DateTime.UtcNow;
			existingToken.RevokeByIp = ipAddress;

			// Tạo Access Token mới
			var newAccessToken = _jwtService.GenerateAccessToken(user);

			// Tạo Refresh Token mới
			var newRefreshToken = _jwtService.GenerateRefreshToken(ipAddress);
			existingToken.ReplacedByToken = newRefreshToken.Token;

			user.RefreshTokens.Add(newRefreshToken);
			await _userRepository.UpdateAsync(user);
			await _userRepository.SaveChangesAsync();

			var result = new RefreshTokenResponseDto
			{
				Token = newAccessToken,
				RefreshToken = newRefreshToken.Token
			};

			return Result<RefreshTokenResponseDto>.Success(result);
		}

		public async Task<Result<string>> LogoutAsync(Guid userId, string refreshToken, string ipAddress)
		{
			var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);
			if (user == null || user.Id != userId)
				return Result<string>.Failure("Refresh token không hợp lệ");
			var existingToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);
			existingToken.RevokeAt = DateTime.UtcNow;
			existingToken.RevokeByIp = ipAddress;

			await _userRepository.UpdateAsync(user);

			return Result<string>.Success("Đăng xuất thành công");
		}
	}
}
