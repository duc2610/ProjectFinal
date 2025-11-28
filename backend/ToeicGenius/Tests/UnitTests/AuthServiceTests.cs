using FluentAssertions;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
using Moq;
using ToeicGenius.Domains.DTOs.Requests.Auth;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Helpers;
using Xunit;
using Google.Apis.Auth;
using ToeicGenius.Domains.DTOs.Responses.Auth;

namespace ToeicGenius.Tests.UnitTests
{
    public class AuthServiceTests
    {
        private readonly Mock<IJwtService> _jwtServiceMock = new();
        private readonly Mock<IEmailService> _emailServiceMock = new();
        private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
        private readonly Mock<IUserRepository> _userRepoMock = new();
        private readonly Mock<IUserOtpRepository> _userOtpRepoMock = new();
        private readonly Mock<IRoleRepository> _roleRepoMock = new();
        private readonly Mock<IGoogleAuthService> _googleAuthMock = new();
        private readonly Mock<IHttpClientFactory> _httpClientFactoryMock = new();

        private AuthService CreateService()
        {
            _unitOfWorkMock.Setup(u => u.Users).Returns(_userRepoMock.Object);
            _unitOfWorkMock.Setup(u => u.UserOtps).Returns(_userOtpRepoMock.Object);
            _unitOfWorkMock.Setup(u => u.Roles).Returns(_roleRepoMock.Object);

            return new AuthService(
                Mock.Of<IConfiguration>(),
                _jwtServiceMock.Object,
                _emailServiceMock.Object,
                _unitOfWorkMock.Object,
                _httpClientFactoryMock.Object,
                _googleAuthMock.Object
            );
        }

        #region 1. LoginAsync Tests
        // --------------------- Helper Methods ---------------------
        private LoginRequestDto CreateLoginDto(string email = "examinee@toeicgenius.com", string password = "Examinee@123")
            => new() { Email = email, Password = password };

        private User CreateUser(string email, string password = "Examinee@123", UserStatus status = UserStatus.Active)
            => new()
            {
                Id = Guid.NewGuid(),
                Email = email,
                FullName = "Examinee",
                Status = status,
                PasswordHash = SecurityHelper.HashPassword(password),
                RefreshTokens = new List<RefreshToken>()
            };

        // UTCID01: Đăng nhập thành công với tài khoản active
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID01")]
        [Fact]
        public async Task UTCID01_LoginAsync_ValidCredentialsAndActiveUser_ReturnsSuccessWithTokensAndPersistsRefreshToken()
        {
            // ARRANGE
            var loginDto = CreateLoginDto();
            var user = CreateUser(loginDto.Email);

            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync(user);
            _jwtServiceMock.Setup(j => j.GenerateAccessToken(user)).Returns("FAKE_ACCESS_TOKEN");
            _jwtServiceMock.Setup(j => j.GenerateRefreshToken(It.IsAny<string>())).Returns(new RefreshToken { Token = "FAKE_REFRESH_TOKEN" });

            var service = CreateService();

            var result = await service.LoginAsync(loginDto, "192.168.1.100");

            result.IsSuccess.Should().BeTrue();
            result.Data.Token.Should().Be("FAKE_ACCESS_TOKEN");
            result.Data.RefreshToken.Should().Be("FAKE_REFRESH_TOKEN");
            result.Data.Email.Should().Be(loginDto.Email);
            user.RefreshTokens.Should().HaveCount(1);

            _jwtServiceMock.Verify(j => j.GenerateRefreshToken("192.168.1.100"), Times.Once);
            _unitOfWorkMock.Verify(u => u.Users.UpdateAsync(user), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        // UTCID02: Sai mật khẩu → trả về Failure + InvalidCredentials
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID02")]
        [Fact]
        public async Task UTCID02_LoginAsync_InvalidPassword_ReturnsFailureWithInvalidCredentials()
        {
            //ARRANGE
            var loginDto = CreateLoginDto(password: "examinee@123");

            var user = CreateUser(loginDto.Email);

            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync(user);

            var service = CreateService();
            var result = await service.LoginAsync(loginDto, "192.168.1.100");

            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.InvalidCredentials);
            _jwtServiceMock.Verify(j => j.GenerateAccessToken(It.IsAny<User>()), Times.Never());
        }

        // UTCID03: Email không tồn tại → trả về Failure + InvalidCredentials
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID03")]
        [Fact]
        public async Task UTCID03_LoginAsync_NonExistentEmail_ReturnsFailureWithInvalidCredentials()
        {
            var loginDto = CreateLoginDto(email: "notexist@example.com");
            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync((User)null!);

            var service = CreateService();
            var result = await service.LoginAsync(loginDto, "192.168.1.100");

            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.InvalidCredentials);
        }

        // UTCID04: Tài khoản bị Banned → trả về Failure + message riêng
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID04")]
        [Fact]
        public async Task UTCID04_LoginAsync_BannedAccount_ReturnsFailureWithBannedMessage()
        {
            var loginDto = CreateLoginDto(email: "banned@example.com");
            var bannedUser = CreateUser(loginDto.Email, status: UserStatus.Banned);

            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync(bannedUser);

            var service = CreateService();
            var result = await service.LoginAsync(loginDto, "192.168.1.100");

            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.AccountBanned);
        }

        // UTCID05: Nhập mật khẩu trống → trả về Failure + message riêng
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID05")]
        [Fact]
        public async Task UTCID05_LoginAsync_BlankPassword_ReturnsFailureWithMessage()
        {
            var loginDto = CreateLoginDto(password: "");
            var user = CreateUser(loginDto.Email);

            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync(user);

            var service = CreateService();
            var result = await service.LoginAsync(loginDto, "192.168.1.100");

            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.InvalidCredentials);
        }

        // UTCID06: Email trống → GetByEmailAsync trả null → trả về InvalidCredentials
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID06")]
        [Fact]
        public async Task UTCID06_LoginAsync_EmptyEmail_ReturnsFailureWithInvalidCredentials()
        {
            var loginDto = CreateLoginDto(email: "");
            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync((User)null!);

            var service = CreateService();
            var result = await service.LoginAsync(loginDto, "192.168.1.100");

            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.InvalidCredentials);
        }

        // UTCID07: Tài khoản đã bị xóa (soft-delete) → trả về InvalidCredentials
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID07")]
        [Fact]
        public async Task UTCID07_LoginAsync_SoftDeletedAccount_ReturnsInvalidCredentials()
        {
            var loginDto = CreateLoginDto(email: "deleted@example.com");
            var deletedUser = CreateUser(loginDto.Email, status: UserStatus.Deleted);
            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync(deletedUser);

            var service = CreateService();
            var result = await service.LoginAsync(loginDto, "192.168.1.100");

            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.InvalidCredentials);
        }

        // UTCID08: Ip trống và đăng nhập không thành công, GenerateRefreshtoken trả ra exception
        [Trait("Category", "Login")]
        [Trait("TestCase", "UTCID08")]
        [Fact]
        public async Task UTCID08_LoginAsync_BlankIpAddress_ReturnsSuccessWithTokensAndPersistsRefreshToken()
        {
            var loginDto = CreateLoginDto();
            var user = CreateUser(loginDto.Email);

            _userRepoMock.Setup(r => r.GetByEmailAsync(loginDto.Email)).ReturnsAsync(user);
            _jwtServiceMock.Setup(j => j.GenerateAccessToken(user)).Returns("FAKE_ACCESS_TOKEN");
            _jwtServiceMock.Setup(j => j.GenerateRefreshToken(It.IsAny<string>())).Returns(new RefreshToken { Token = "FAKE_REFRESH_TOKEN" });

            var service = CreateService();
            var result = await service.LoginAsync(loginDto, "");

            result.IsSuccess.Should().BeTrue();
            result.Data.RefreshToken.Should().Be("FAKE_REFRESH_TOKEN");
            _jwtServiceMock.Verify(j => j.GenerateRefreshToken(""), Times.Once);
        }
		#endregion	
		#region 2. ChangePasswordAsync Tests
		private ChangePasswordDto CreateChangePasswordDto(string? oldPass, string? newPass, string? confirmPass)
			=> new() { OldPassword = oldPass, NewPassword = newPass, ConfirmNewPassword = confirmPass };

		// UTCID01(A): user Id null
		[Trait("Category", "ChangePassword")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_ChangePasswordAsync_InvalidUserId_ReturnsIdInvalid()
		{
			var service = CreateService();
			var result = await service.ChangePasswordAsync(CreateChangePasswordDto(oldPass:"valid@123", newPass:"valid@34",confirmPass:"valid@34"), "");

			result.Should().Be(ErrorMessages.IdInvalid);
		}

		// UTCID02(A): User không tồn tại 
		[Trait("Category", "ChangePassword")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_ChangePasswordAsync_UserNotFound_ReturnsUserNotFound()
		{
			var userId = Guid.NewGuid();
			_userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync((User)null!);

			var service = CreateService();
			var result = await service.ChangePasswordAsync(CreateChangePasswordDto(oldPass: "valid@123", newPass: "valid@34", confirmPass: "valid@34"), userId.ToString());

			result.Should().Be(ErrorMessages.UserNotFound);
		}

		// UTCID03(N): Đăng nhập bằng google lần đầu
		[Trait("Category", "ChangePassword")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_ChangePasswordAsync_FirstTimeGoogleUser_SetsPasswordAndReturnsSuccess()
		{
			var userId = Guid.NewGuid();
			var user = CreateUser("google@example.com");
			user.PasswordHash = null; // Simulate Google user

			_userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

			var service = CreateService();
			var result = await service.ChangePasswordAsync(CreateChangePasswordDto(oldPass: "valid@123", newPass: "valid@34", confirmPass: "valid@34"), userId.ToString());

			result.Should().BeEmpty();
			user.PasswordHash.Should().NotBeNullOrEmpty();
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(user), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID04(A): Old pass không khớp 
		[Trait("Category", "ChangePassword")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_ChangePasswordAsync_OldPasswordMismatch_ReturnsOldPasswordMismatch()
		{
			var userId = Guid.NewGuid();
			var user = CreateUser("user@example.com", "CorrectOldPass@123");

			_userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

			var dto = CreateChangePasswordDto(oldPass: "invalid@12", newPass: "valid@34", confirmPass: "valid@34");
			var service = CreateService();
			var result = await service.ChangePasswordAsync(dto, userId.ToString());

			result.Should().Be(ErrorMessages.OldPasswordMismatch);
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
		}

		// UTCID05(N): Đổi pass thành công
		[Trait("Category", "ChangePassword")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_ChangePasswordAsync_ValidRequest_UpdatesPasswordAndReturnsSuccess()
		{
			var userId = Guid.NewGuid();
			var oldPass = "valid@123";
			var user = CreateUser("user@example.com", oldPass);

			_userRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);

			var dto = CreateChangePasswordDto(oldPass: "valid@123", newPass: "valid@34", confirmPass: "valid@34");
			var service = CreateService();
			var result = await service.ChangePasswordAsync(dto, userId.ToString());

			result.Should().BeEmpty();
			// Verify password changed (hash should be different from old hash, but we can't easily check exact value due to salt)
			// But we can verify UpdateAsync was called
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(user), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}
		#endregion
		#region 3. SendRegistrationOtpAsync Tests
		private RegisterRequestDto CreateRegisterRequestDto(string email = "anv@gmail.com")
			=> new() { Email = email, FullName = "Nguyen Van A", Password = "password@123" };

		// UTCID01: Email đã tồn tại
		[Trait("Category", "SendRegistrationOtp")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_SendRegistrationOtpAsync_EmailAlreadyExists_ReturnsEmailAlreadyExists()
		{
			// Arrange
			var dto = CreateRegisterRequestDto();
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync(new User());

			var service = CreateService();

			// Act
			var result = await service.SendRegistrationOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.EmailAlreadyExists);
			_emailServiceMock.Verify(e => e.SendMail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID02: Gửi OTP thành công
		[Trait("Category", "SendRegistrationOtp")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_SendRegistrationOtpAsync_ValidRequest_SendsOtpAndReturnsSuccess()
		{
			// Arrange
			var dto = CreateRegisterRequestDto();
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);

			var service = CreateService();

			// Act
			var result = await service.SendRegistrationOtpAsync(dto);

			// Assert
			result.Should().BeEmpty();
			_unitOfWorkMock.Verify(u => u.UserOtps.AddAsync(It.IsAny<UserOtp>()), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
			_emailServiceMock.Verify(e => e.SendMail(dto.Email, "OTP Đăng ký", It.Is<string>(s => s.Contains("Mã OTP của bạn là"))), Times.Once);
		}

		// UTCID03: Lỗi hệ thống (Exception)
		[Trait("Category", "SendRegistrationOtp")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_SendRegistrationOtpAsync_ExceptionThrown_ReturnsOperationFailed()
		{
			// Arrange
			var dto = CreateRegisterRequestDto();
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ThrowsAsync(new Exception("DB Error"));

			var service = CreateService();

			// Act
			var result = await service.SendRegistrationOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.OperationFailed);
		}
		#endregion
		#region 4. VerifyRegistrationOtpAsync Tests
		private RegisterVerifyDto CreateRegisterVerifyDto(string email = "anv@gmail.com", string otp = "123456")
			=> new() { Email = email, OtpCode = otp, FullName = "Nguyen Van A", Password = "password@123" };

		// UTCID01: OTP không hợp lệ
		[Trait("Category", "VerifyRegistrationOtp")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_VerifyRegistrationOtpAsync_InvalidOtp_ReturnsOtpInvalid()
		{
			// Arrange
			var dto = CreateRegisterVerifyDto(otp: "999999");
			// Mock OTP record but with different hash/expired
			var otpRecord = new UserOtp
			{
				Email = dto.Email,
				OtpCodeHash = SecurityHelper.HashOtp("123456"), // Different OTP
				ExpiresAt = DateTime.Now.AddMinutes(10),
				Type = (int)OtpType.Registration
			};
			_userOtpRepoMock.Setup(r => r.GetOtpByEmailAsync(dto.Email, (int)OtpType.Registration)).ReturnsAsync(otpRecord);

			var service = CreateService();

			// Act
			var result = await service.VerifyRegistrationOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.OtpInvalid);
		}

		// UTCID02: Email đã tồn tại
		[Trait("Category", "VerifyRegistrationOtp")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_VerifyRegistrationOtpAsync_EmailAlreadyExists_ReturnsEmailAlreadyExists()
		{
			// Arrange
			var dto = CreateRegisterVerifyDto(email: "exist@gmail.com");
			var otpRecord = new UserOtp
			{
				Email = dto.Email,
				OtpCodeHash = SecurityHelper.HashOtp(dto.OtpCode),
				ExpiresAt = DateTime.Now.AddMinutes(10),
				Type = (int)OtpType.Registration
			};
			_userOtpRepoMock.Setup(r => r.GetOtpByEmailAsync(dto.Email, (int)OtpType.Registration)).ReturnsAsync(otpRecord);
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync(new User());

			var service = CreateService();

			// Act
			var result = await service.VerifyRegistrationOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.EmailAlreadyExists);
		}

		// UTCID03: Xác thực thành công, tạo user
		[Trait("Category", "VerifyRegistrationOtp")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_VerifyRegistrationOtpAsync_ValidRequest_CreatesUserAndReturnsSuccess()
		{
			// Arrange
			var dto = CreateRegisterVerifyDto();
			var otpRecord = new UserOtp
			{
				Email = dto.Email,
				OtpCodeHash = SecurityHelper.HashOtp(dto.OtpCode),
				ExpiresAt = DateTime.Now.AddMinutes(10),
				Type = (int)OtpType.Registration
			};
			_userOtpRepoMock.Setup(r => r.GetOtpByEmailAsync(dto.Email, (int)OtpType.Registration)).ReturnsAsync(otpRecord);
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);
			_roleRepoMock.Setup(r => r.GetByIdAsync((int)UserRole.Examinee)).ReturnsAsync(new Role { Id = (int)UserRole.Examinee, RoleName = "Examinee" });

			var service = CreateService();

			// Act
			var result = await service.VerifyRegistrationOtpAsync(dto);

			// Assert
			result.Should().BeEmpty();
			_unitOfWorkMock.Verify(u => u.Users.AddAsync(It.Is<User>(u => u.Email == dto.Email && u.Roles.Any(r => r.RoleName == "Examinee"))), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
			_unitOfWorkMock.Verify(u => u.UserOtps.UpdateAsync(It.Is<UserOtp>(o => o.UsedAt != null)), Times.Once);
		}

		// UTCID04: Role không tìm thấy → tạo user với role bằng examinee
		[Trait("Category", "VerifyRegistrationOtp")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_VerifyRegistrationOtpAsync_RoleNotFound_CreatesUserWithoutRole()
		{
			// Arrange
			var dto = CreateRegisterVerifyDto();
			var otpRecord = new UserOtp
			{
				Email = dto.Email,
				OtpCodeHash = SecurityHelper.HashOtp(dto.OtpCode),
				ExpiresAt = DateTime.Now.AddMinutes(10),
				Type = (int)OtpType.Registration
			};
			_userOtpRepoMock.Setup(r => r.GetOtpByEmailAsync(dto.Email, (int)OtpType.Registration)).ReturnsAsync(otpRecord);
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);
			_roleRepoMock.Setup(r => r.GetByIdAsync((int)UserRole.Examinee)).ReturnsAsync((Role)null!);

			var service = CreateService();

			// Act
			var result = await service.VerifyRegistrationOtpAsync(dto);

			// Assert
			result.Should().BeEmpty();
			_unitOfWorkMock.Verify(u => u.Users.AddAsync(It.Is<User>(u => u.Email == dto.Email && u.Roles.Count == 1 && u.Roles.First().RoleName == "Examinee")), Times.Once);
		}

		// UTCID05: Lỗi hệ thống
		[Trait("Category", "VerifyRegistrationOtp")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UTCID05_VerifyRegistrationOtpAsync_ExceptionThrown_ReturnsOperationFailed()
		{
			// Arrange
			var dto = CreateRegisterVerifyDto();
			_userOtpRepoMock.Setup(r => r.GetOtpByEmailAsync(It.IsAny<string>(), It.IsAny<int>())).ThrowsAsync(new Exception("DB Error"));

			var service = CreateService();

			// Act
			var result = await service.VerifyRegistrationOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.OperationFailed);
		}
		#endregion

		#region 5. LoginWithGoogleAsync Tests
		// UTCID01: Token exchange fails (IdToken empty)
		[Trait("Category", "LoginWithGoogle")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_LoginWithGoogleAsync_TokenExchangeFails_ThrowsException()
		{
			// Arrange
			var code = "auth_code";
			_googleAuthMock.Setup(g => g.ExchangeCodeForTokensAsync(code))
				.ReturnsAsync(new GoogleTokenResponse { IdToken = "" });

			var service = CreateService();

			// Act
			var act = async () => await service.LoginWithGoogleAsync(code, "127.0.0.1");

			// Assert
			await act.Should().ThrowAsync<Exception>().WithMessage("Google id_token is empty");
		}

		// UTCID02: Token validation fails (Payload null or Email empty)
		[Trait("Category", "LoginWithGoogle")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_LoginWithGoogleAsync_TokenValidationFails_ThrowsException()
		{
			// Arrange
			var code = "auth_code";
			var idToken = "valid_id_token";
			_googleAuthMock.Setup(g => g.ExchangeCodeForTokensAsync(code))
				.ReturnsAsync(new GoogleTokenResponse { IdToken = idToken });
			_googleAuthMock.Setup(g => g.ValidateIdTokenAsync(idToken))
				.ReturnsAsync((GoogleJsonWebSignature.Payload)null!);

			var service = CreateService();

			// Act
			var act = async () => await service.LoginWithGoogleAsync(code, "127.0.0.1");

			// Assert
			await act.Should().ThrowAsync<Exception>().WithMessage("Google user payload invalid");
		}

		// UTCID03: New user creation
		[Trait("Category", "LoginWithGoogle")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_LoginWithGoogleAsync_NewUser_CreatesUserAndReturnsSuccess()
		{
			// Arrange
			var code = "auth_code";
			var idToken = "valid_id_token";
			var payload = new GoogleJsonWebSignature.Payload { Email = "anv@gmail.com", Name = "Nguyen Van A", Subject = "google_id_123" };

			_googleAuthMock.Setup(g => g.ExchangeCodeForTokensAsync(code))
				.ReturnsAsync(new GoogleTokenResponse { IdToken = idToken });
			_googleAuthMock.Setup(g => g.ValidateIdTokenAsync(idToken))
				.ReturnsAsync(payload);
			_userRepoMock.Setup(r => r.GetByEmailAsync(payload.Email)).ReturnsAsync((User)null!);
			_roleRepoMock.Setup(r => r.GetByIdAsync((int)UserRole.Examinee)).ReturnsAsync(new Role { Id = (int)UserRole.Examinee });
			_jwtServiceMock.Setup(j => j.GenerateAccessToken(It.IsAny<User>())).Returns("access_token");
			_jwtServiceMock.Setup(j => j.GenerateRefreshToken(It.IsAny<string>())).Returns(new RefreshToken { Token = "refresh_token" });

			var service = CreateService();

			// Act
			var result = await service.LoginWithGoogleAsync(code, "127.0.0.1");

			// Assert
			result.Should().NotBeNull();
			result.Email.Should().Be(payload.Email);
			_unitOfWorkMock.Verify(u => u.Users.AddAsync(It.Is<User>(u => u.Email == payload.Email && u.GoogleId == payload.Subject)), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
		}

		// UTCID04: Existing user login (update GoogleId)
		[Trait("Category", "LoginWithGoogle")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_LoginWithGoogleAsync_ExistingUser_UpdatesGoogleIdAndReturnsSuccess()
		{
			// Arrange
			var code = "auth_code";
			var idToken = "valid_id_token";
			var payload = new GoogleJsonWebSignature.Payload { Email = "existing@gmail.com", Subject = "google_id_456" };
			var existingUser = new User { Id = Guid.NewGuid(), Email = payload.Email, GoogleId = "", RefreshTokens = new List<RefreshToken>() };

			_googleAuthMock.Setup(g => g.ExchangeCodeForTokensAsync(code))
				.ReturnsAsync(new GoogleTokenResponse { IdToken = idToken });
			_googleAuthMock.Setup(g => g.ValidateIdTokenAsync(idToken))
				.ReturnsAsync(payload);
			_userRepoMock.Setup(r => r.GetByEmailAsync(payload.Email)).ReturnsAsync(existingUser);
			_jwtServiceMock.Setup(j => j.GenerateAccessToken(existingUser)).Returns("access_token");
			_jwtServiceMock.Setup(j => j.GenerateRefreshToken(It.IsAny<string>())).Returns(new RefreshToken { Token = "refresh_token" });

			var service = CreateService();

			// Act
			var result = await service.LoginWithGoogleAsync(code, "127.0.0.1");

			// Assert
			result.Should().NotBeNull();
			existingUser.GoogleId.Should().Be(payload.Subject);
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(existingUser), Times.AtLeastOnce);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.AtLeastOnce);
		}
		#endregion

		#region 6. RefreshTokenAsync Tests
		// UTCID01: User không tồn tại (Invalid refresh token)
		[Trait("Category", "RefreshToken")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task RefreshTokenAsync_UserNotFound_ReturnsFailure()
		{
			// Arrange
			var refreshToken = "invalid_token";
			_userRepoMock.Setup(r => r.GetByRefreshTokenAsync(refreshToken)).ReturnsAsync((User)null!);

			var service = CreateService();

			// Act
			var result = await service.RefreshTokenAsync(refreshToken, "127.0.0.1");

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Refresh token không hợp lệ");
		}

		// UTCID02: Token không tồn tại trong danh sách tokens của user
		[Trait("Category", "RefreshToken")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task RefreshTokenAsync_TokenNotFound_ReturnsFailure()
		{
			// Arrange
			var refreshToken = "token_not_in_list";
			var user = new User
			{
				Id = Guid.NewGuid(),
				Email = "test@example.com",
				RefreshTokens = new List<RefreshToken>()
			};
			_userRepoMock.Setup(r => r.GetByRefreshTokenAsync(refreshToken)).ReturnsAsync(user);

			var service = CreateService();

			// Act
			var result = await service.RefreshTokenAsync(refreshToken, "127.0.0.1");

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Refresh token đã hết hạn hoặc bị thu hồi");
		}

		// UTCID03: Token đã hết hạn
		[Trait("Category", "RefreshToken")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task RefreshTokenAsync_TokenExpired_ReturnsFailure()
		{
			// Arrange
			var refreshToken = "expired_token";
			var expiredToken = new RefreshToken
			{
				Token = refreshToken,
				ExpiresAt = DateTime.Now.AddDays(-1), // Expired
				RevokeAt = null
			};
			var user = new User
			{
				Id = Guid.NewGuid(),
				Email = "test@example.com",
				RefreshTokens = new List<RefreshToken> { expiredToken }
			};
			_userRepoMock.Setup(r => r.GetByRefreshTokenAsync(refreshToken)).ReturnsAsync(user);

			var service = CreateService();

			// Act
			var result = await service.RefreshTokenAsync(refreshToken, "127.0.0.1");

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Refresh token đã hết hạn hoặc bị thu hồi");
		}

		// UTCID04: Token đã bị revoke
		[Trait("Category", "RefreshToken")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task RefreshTokenAsync_TokenRevoked_ReturnsFailure()
		{
			// Arrange
			var refreshToken = "revoked_token";
			var revokedToken = new RefreshToken
			{
				Token = refreshToken,
				ExpiresAt = DateTime.Now.AddDays(7),
				RevokeAt = DateTime.Now.AddDays(-1) // Already revoked
			};
			var user = new User
			{
				Id = Guid.NewGuid(),
				Email = "test@example.com",
				RefreshTokens = new List<RefreshToken> { revokedToken }
			};
			_userRepoMock.Setup(r => r.GetByRefreshTokenAsync(refreshToken)).ReturnsAsync(user);

			var service = CreateService();

			// Act
			var result = await service.RefreshTokenAsync(refreshToken, "127.0.0.1");

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("Refresh token đã hết hạn hoặc bị thu hồi");
		}

		// UTCID05: Refresh token thành công
		[Trait("Category", "RefreshToken")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task RefreshTokenAsync_ValidToken_ReturnsSuccessWithNewTokens()
		{
			// Arrange
			var refreshToken = "valid_token";
			var validToken = new RefreshToken
			{
				Token = refreshToken,
				ExpiresAt = DateTime.Now.AddDays(7),
				RevokeAt = null
			};
			var user = new User
			{
				Id = Guid.NewGuid(),
				Email = "test@example.com",
				RefreshTokens = new List<RefreshToken> { validToken }
			};
			_userRepoMock.Setup(r => r.GetByRefreshTokenAsync(refreshToken)).ReturnsAsync(user);
			_jwtServiceMock.Setup(j => j.GenerateAccessToken(user)).Returns("new_access_token");
			_jwtServiceMock.Setup(j => j.GenerateRefreshToken(It.IsAny<string>())).Returns(new RefreshToken { Token = "new_refresh_token" });

			var service = CreateService();

			// Act
			var result = await service.RefreshTokenAsync(refreshToken, "127.0.0.1");

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Token.Should().Be("new_access_token");
			result.Data.RefreshToken.Should().Be("new_refresh_token");
			validToken.RevokeAt.Should().NotBeNull();
			validToken.RevokeByIp.Should().Be("127.0.0.1");
			validToken.ReplacedByToken.Should().Be("new_refresh_token");
			user.RefreshTokens.Should().HaveCount(2); // Old + New
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(user), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}
		#endregion

		#region 7. SendResetPasswordOtpAsync Tests
		private ResetPasswordRequestDto CreateResetPasswordRequestDto(string email = "reset@gmail.com")
			=> new() { Email = email };

		// UTCID01: User không tồn tại hoặc không active
		[Trait("Category", "SendResetPasswordOtp")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_SendResetPasswordOtpAsync_UserNotFoundOrInactive_ReturnsUserNotFound()
		{
			// Arrange
			var dto = CreateResetPasswordRequestDto();
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);

			var service = CreateService();

			// Act
			var result = await service.SendResetPasswordOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.UserNotFound);
			_emailServiceMock.Verify(e => e.SendMail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
		}

		// UTCID02: User inactive
		[Trait("Category", "SendResetPasswordOtp")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_SendResetPasswordOtpAsync_UserInactive_ReturnsUserNotFound()
		{
			// Arrange
			var dto = CreateResetPasswordRequestDto();
			var inactiveUser = new User { Email = dto.Email, Status = UserStatus.Banned };
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync(inactiveUser);

			var service = CreateService();

			// Act
			var result = await service.SendResetPasswordOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.UserNotFound);
		}

		// UTCID03: Gửi OTP thành công
		[Trait("Category", "SendResetPasswordOtp")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_SendResetPasswordOtpAsync_ValidUser_SendsOtpAndReturnsSuccess()
		{
			// Arrange
			var dto = CreateResetPasswordRequestDto();
			var user = new User { Email = dto.Email, Status = UserStatus.Active };
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync(user);

			var service = CreateService();

			// Act
			var result = await service.SendResetPasswordOtpAsync(dto);

			// Assert
			result.Should().BeEmpty();
			_unitOfWorkMock.Verify(u => u.UserOtps.AddAsync(It.IsAny<UserOtp>()), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
			_emailServiceMock.Verify(e => e.SendMail(dto.Email, "OTP Đổi mật khẩu", It.Is<string>(s => s.Contains("Mã OTP của bạn là"))), Times.Once);
		}

		// UTCID04: Exception handling
		[Trait("Category", "SendResetPasswordOtp")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UTCID04_SendResetPasswordOtpAsync_ExceptionThrown_ReturnsOperationFailed()
		{
			// Arrange
			var dto = CreateResetPasswordRequestDto();
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ThrowsAsync(new Exception("DB Error"));

			var service = CreateService();

			// Act
			var result = await service.SendResetPasswordOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.OperationFailed);
		}
		#endregion

		#region 8. VerifyResetPasswordOtpAsync Tests
		private ResetPasswordVerifyDto CreateResetPasswordVerifyDto(string email = "verify@example.com", string otp = "123456")
			=> new() { Email = email, OtpCode = otp };

		// UTCID01: OTP không hợp lệ
		[Trait("Category", "VerifyResetPasswordOtp")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_VerifyResetPasswordOtpAsync_InvalidOtp_ReturnsOtpInvalid()
		{
			// Arrange
			var dto = CreateResetPasswordVerifyDto();
			var otpRecord = new UserOtp
			{
				Email = dto.Email,
				OtpCodeHash = SecurityHelper.HashOtp("999999"), // Different OTP
				ExpiresAt = DateTime.Now.AddMinutes(10),
				Type = (int)OtpType.ResetPassword
			};
			_userOtpRepoMock.Setup(r => r.GetOtpByEmailAsync(dto.Email, (int)OtpType.ResetPassword)).ReturnsAsync(otpRecord);

			var service = CreateService();

			// Act
			var result = await service.VerifyResetPasswordOtpAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.OtpInvalid);
			_unitOfWorkMock.Verify(u => u.UserOtps.UpdateAsync(It.IsAny<UserOtp>()), Times.Never);
		}

		// UTCID02: OTP hợp lệ
		[Trait("Category", "VerifyResetPasswordOtp")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_VerifyResetPasswordOtpAsync_ValidOtp_MarksOtpAsUsedAndReturnsSuccess()
		{
			// Arrange
			var dto = CreateResetPasswordVerifyDto(otp: "999999");
			var otpRecord = new UserOtp
			{
				Email = dto.Email,
				OtpCodeHash = SecurityHelper.HashOtp(dto.OtpCode),
				ExpiresAt = DateTime.Now.AddMinutes(10),
				Type = (int)OtpType.ResetPassword
			};
			_userOtpRepoMock.Setup(r => r.GetOtpByEmailAsync(dto.Email, (int)OtpType.ResetPassword)).ReturnsAsync(otpRecord);

			var service = CreateService();

			// Act
			var result = await service.VerifyResetPasswordOtpAsync(dto);

			// Assert
			result.Should().BeEmpty();
			_unitOfWorkMock.Verify(u => u.UserOtps.UpdateAsync(It.Is<UserOtp>(o => o.UsedAt != null)), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}
		#endregion

		#region 9. ConfirmResetPasswordAsync Tests
		private ResetPasswordConfirmDto CreateResetPasswordConfirmDto(string email = "confirm@gmail.com")
			=> new() { Email = email, OtpCode = "123456", NewPassword = "NewPass@123", ConfirmNewPassword = "NewPass@123" };

		// UTCID01: User không tồn tại
		[Trait("Category", "ConfirmResetPassword")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UTCID01_ConfirmResetPasswordAsync_UserNotFound_ReturnsUserNotFound()
		{
			// Arrange
			var dto = CreateResetPasswordConfirmDto();
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);

			var service = CreateService();

			// Act
			var result = await service.ConfirmResetPasswordAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.UserNotFound);
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
		}

		// UTCID02: Reset password thành công
		[Trait("Category", "ConfirmResetPassword")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UTCID02_ConfirmResetPasswordAsync_ValidRequest_UpdatesPasswordAndReturnsSuccess()
		{
			// Arrange
			var dto = CreateResetPasswordConfirmDto();
			var user = new User { Email = dto.Email, PasswordHash = "old_hash" };
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync(user);

			var service = CreateService();

			// Act
			var result = await service.ConfirmResetPasswordAsync(dto);

			// Assert
			result.Should().BeEmpty();
			user.PasswordHash.Should().NotBe("old_hash");
			user.UpdatedAt.Should().NotBeNull();
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(user), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID03: Exception handling
		[Trait("Category", "ConfirmResetPassword")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UTCID03_ConfirmResetPasswordAsync_ExceptionThrown_ReturnsOperationFailed()
		{
			// Arrange
			var dto = CreateResetPasswordConfirmDto();
			_userRepoMock.Setup(r => r.GetByEmailAsync(dto.Email)).ThrowsAsync(new Exception("DB Error"));

			var service = CreateService();

			// Act
			var result = await service.ConfirmResetPasswordAsync(dto);

			// Assert
			result.Should().Be(ErrorMessages.OperationFailed);
		}
		#endregion

		
	}
}
