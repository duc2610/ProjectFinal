using System.Text.Json;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.Auth;
using ToeicGenius.Domains.DTOs.Responses.Auth;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Helpers;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IGoogleAuthService _googleAuthService;

        private static readonly JsonSerializerOptions _jsonOpt = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public AuthService(
            IConfiguration configuration,
            IJwtService jwtService,
            IEmailService emailService,
            IUnitOfWork unitOfWork,
            IHttpClientFactory httpClientFactory,
            IGoogleAuthService googleAuthService)
        {
            _configuration = configuration;
            _jwtService = jwtService;
            _emailService = emailService;
            _unitOfWork = unitOfWork;
            _httpClientFactory = httpClientFactory;
            _googleAuthService = googleAuthService;
        }

        public async Task<string> ChangePasswordAsync(ChangePasswordDto changePasswordRequest, string userId)
        {
            if (!Guid.TryParse(userId, out var guidUserId))
                return ErrorMessages.IdInvalid;

            var user = await _unitOfWork.Users.GetByIdAsync(guidUserId);
            if (user == null)
                return ErrorMessages.UserNotFound;

            // User tạo bằng Google lần đầu, chưa có mật khẩu
            if (string.IsNullOrEmpty(user.PasswordHash))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordRequest.NewPassword);
                user.UpdatedAt = Now;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                return "";
            }

            if (!SecurityHelper.VerifyPassword(changePasswordRequest.OldPassword, user.PasswordHash))
                return ErrorMessages.OldPasswordMismatch;

            user.PasswordHash = SecurityHelper.HashPassword(changePasswordRequest.NewPassword);
            user.UpdatedAt = Now;
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return "";
        }

        public async Task<string> ConfirmResetPasswordAsync(ResetPasswordConfirmDto resetPasswordConfirmDto)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(resetPasswordConfirmDto.Email);
                if (user == null) return ErrorMessages.UserNotFound;

                user.PasswordHash = SecurityHelper.HashPassword(resetPasswordConfirmDto.NewPassword);
                user.UpdatedAt = Now;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                return "";
            }
            catch
            {
                return ErrorMessages.OperationFailed;
            }
        }

        public async Task<User?> GetUserByIdAsync(Guid userId) => await _unitOfWork.Users.GetByIdAsync(userId);

        public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto loginDto, string ipAddress)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(loginDto.Email);

            if (user == null || user.Status != UserStatus.Active || user.PasswordHash == null)
                return Result<LoginResponseDto>.Failure(ErrorMessages.InvalidCredentials);

            if (!SecurityHelper.VerifyPassword(loginDto.Password, user.PasswordHash))
                return Result<LoginResponseDto>.Failure(ErrorMessages.InvalidCredentials);

            // Issue tokens
            var token = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken(ipAddress);

            user.RefreshTokens.Add(refreshToken);
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var response = new LoginResponseDto
            {
                Token = token,
                RefreshToken = refreshToken.Token,
                Fullname = user.FullName,
                Email = user.Email,
                UserId = user.Id,
                ExpireAt = Now.AddMinutes(30)
            };

            return Result<LoginResponseDto>.Success(response);
        }

        public async Task<LoginResponseDto> LoginWithGoogleAsync(string code, string ipAddress)
        {
            // 1) Exchange code -> tokens (redirect_uri = "postmessage")
            var tokens = await _googleAuthService.ExchangeCodeForTokensAsync(code);
            if (string.IsNullOrWhiteSpace(tokens.IdToken))
                throw new Exception("Google id_token is empty");

            // 2) Validate id_token
            var payload = await _googleAuthService.ValidateIdTokenAsync(tokens.IdToken);
            if (payload == null || string.IsNullOrWhiteSpace(payload.Email))
                throw new Exception("Google user payload invalid");

            // 3) Find-or-create user
            var user = await _unitOfWork.Users.GetByEmailAsync(payload.Email);
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = payload.Email,
                    FullName = payload.Name ?? payload.Email,
                    GoogleId = payload.Subject,
                    Status = UserStatus.Active,
                    CreatedAt = Now
                };

                var defaultRole = await _unitOfWork.Roles.GetByIdAsync((int)UserRole.Examinee);
                if (defaultRole != null)
                    user.Roles.Add(defaultRole);

                await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.SaveChangesAsync();
            }
            else
            {
                // cập nhật GoogleId (nếu lần đầu dùng Google)
                if (string.IsNullOrEmpty(user.GoogleId))
                    user.GoogleId = payload.Subject;

                user.UpdatedAt = Now;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
            }

            // 4) Issue JWT & Refresh token
            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken(ipAddress);

            user.RefreshTokens.Add(refreshToken);
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            // 5) Response giống login thường
            return new LoginResponseDto
            {
                UserId = user.Id,
                Fullname = user.FullName,
                Email = user.Email,
                Token = accessToken,
                RefreshToken = refreshToken.Token,
                ExpireAt = Now.AddMinutes(30)
            };
        }

        public async Task<string> SendRegistrationOtpAsync(RegisterRequestDto registerRequestDto)
        {
            try
            {
                var existingUser = await _unitOfWork.Users.GetByEmailAsync(registerRequestDto.Email);
                if (existingUser != null) return ErrorMessages.EmailAlreadyExists;

                var otpCode = await GenerateAndStoreOtpAsync(registerRequestDto.Email, (int)OtpType.Registration);
                await SendOtpByEmailAsync(registerRequestDto.Email, otpCode, "OTP Đăng ký");
                return "";
            }
            catch
            {
                return ErrorMessages.OperationFailed;
            }
        }

        public async Task<string> VerifyRegistrationOtpAsync(RegisterVerifyDto registerDto)
        {
            try
            {
                var valid = await ValidateOtpAsync(registerDto.Email, registerDto.OtpCode, (int)OtpType.Registration);
                if (!valid) return ErrorMessages.OtpInvalid;

                var existingUser = await _unitOfWork.Users.GetByEmailAsync(registerDto.Email);
                if (existingUser != null) return ErrorMessages.EmailAlreadyExists;

                var user = new User
                {
                    Email = registerDto.Email,
                    FullName = registerDto.FullName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                    CreatedAt = Now,
                    Status = UserStatus.Active,
                };

                var defaultRole = await _unitOfWork.Roles.GetByIdAsync((int)UserRole.Examinee);
                if (defaultRole != null) user.Roles.Add(defaultRole);

                await _unitOfWork.Users.AddAsync(user);
                await _unitOfWork.SaveChangesAsync();
                await MarkOtpAsUsedAsync(registerDto.Email, (int)OtpType.Registration);
                return "";
            }
            catch
            {
                return ErrorMessages.OperationFailed;
            }
        }

        public async Task<string> SendResetPasswordOtpAsync(ResetPasswordRequestDto resetPasswordRequestDto)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(resetPasswordRequestDto.Email);
                if (user == null || user.Status != UserStatus.Active) return ErrorMessages.UserNotFound;

                var otpCode = await GenerateAndStoreOtpAsync(resetPasswordRequestDto.Email, (int)OtpType.ResetPassword);
                await SendOtpByEmailAsync(resetPasswordRequestDto.Email, otpCode, "OTP Đổi mật khẩu");
                return "";
            }
            catch
            {
                return ErrorMessages.OperationFailed;
            }
        }

        public async Task<string> VerifyResetPasswordOtpAsync(ResetPasswordVerifyDto resetPasswordVerifyOtpDto)
        {
            var valid = await ValidateOtpAsync(resetPasswordVerifyOtpDto.Email, resetPasswordVerifyOtpDto.OtpCode, (int)OtpType.ResetPassword);
            if (!valid) return ErrorMessages.OtpInvalid;

            await MarkOtpAsUsedAsync(resetPasswordVerifyOtpDto.Email, (int)OtpType.ResetPassword);
            return "";
        }

        public async Task<string> ConfirmResetPasswordAsync(string email, string newPassword)
        {
            try
            {
                var user = await _unitOfWork.Users.GetByEmailAsync(email);
                if (user == null) return ErrorMessages.UserNotFound;

                user.PasswordHash = SecurityHelper.HashPassword(newPassword);
                user.UpdatedAt = Now;
                await _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                return "";
            }
            catch
            {
                return ErrorMessages.OperationFailed;
            }
        }

        public async Task<Result<RefreshTokenResponseDto>> RefreshTokenAsync(string refreshToken, string ipAddress)
        {
            var user = await _unitOfWork.Users.GetByRefreshTokenAsync(refreshToken);
            if (user == null)
                return Result<RefreshTokenResponseDto>.Failure("Invalid refresh token");

            var existingToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);
            if (existingToken == null || existingToken.ExpiresAt <= Now || existingToken.RevokeAt != null)
                return Result<RefreshTokenResponseDto>.Failure("Refresh token expired or revoked");

            existingToken.RevokeAt = Now;
            existingToken.RevokeByIp = ipAddress;

            var newAccessToken = _jwtService.GenerateAccessToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken(ipAddress);
            existingToken.ReplacedByToken = newRefreshToken.Token;

            user.RefreshTokens.Add(newRefreshToken);
            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();

            var result = new RefreshTokenResponseDto
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken.Token
            };

            return Result<RefreshTokenResponseDto>.Success(result);
        }

        public async Task<Result<string>> LogoutAsync(Guid userId, string refreshToken, string ipAddress)
        {
            var user = await _unitOfWork.Users.GetByRefreshTokenAsync(refreshToken);
            if (user == null || user.Id != userId)
                return Result<string>.Failure("Refresh token không hợp lệ");

            var existingToken = user.RefreshTokens.FirstOrDefault(rt => rt.Token == refreshToken);
            if (existingToken == null)
                return Result<string>.Failure("Không tìm thấy refresh token");

            if (existingToken.RevokeAt != null)
                return Result<string>.Failure("Refresh token đã bị hủy trước đó");

            existingToken.RevokeAt = Now;
            existingToken.RevokeByIp = ipAddress;

            await _unitOfWork.Users.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return Result<string>.Success("Đăng xuất thành công");
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
                CreatedAt = Now,
                ExpiresAt = Now.AddMinutes(10)
            };
            await _unitOfWork.UserOtps.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            return otp;
        }

        private async Task<bool> ValidateOtpAsync(string email, string otpCode, int type)
        {
            var record = await _unitOfWork.UserOtps.GetOtpByEmailAsync(email, type);
            if (record == null || record.UsedAt != null) return false;
            return SecurityHelper.ValidateOtp(otpCode, record.OtpCodeHash, record.ExpiresAt);
        }

        private async Task MarkOtpAsUsedAsync(string email, int type)
        {
            var record = await _unitOfWork.UserOtps.GetOtpByEmailAsync(email, type);
            if (record != null)
            {
                record.UsedAt = Now;
                await _unitOfWork.UserOtps.UpdateAsync(record);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        private async Task SendOtpByEmailAsync(string email, string otpCode, string subject)
        {
            var body = $"Mã OTP của bạn là: {otpCode}. Mã có hiệu lực trong 10 phút.";
            await _emailService.SendMail(email, subject, body);
        }
    }
}
