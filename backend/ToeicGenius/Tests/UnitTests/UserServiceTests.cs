using FluentAssertions;
using Moq;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using Xunit;

namespace ToeicGenius.Tests.UnitTests
{
    public class UserServiceTests
    {
        private readonly Mock<IEmailService> _emailServiceMock = new();
        private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();


        private UserService CreateService()
        {
            return new UserService(
                _unitOfWorkMock.Object,
                _emailServiceMock.Object
            );
        }

        // USER SERVICE TESTS
        #region 1. UserService_GetUserByIdAsync Tests

        // Helper method to create a test user
        private User CreateTestUser(Guid userId, string email = "test@example.com", string fullName = "Test User")
            => new()
            {
                Id = userId,
                Email = email,
                FullName = fullName,
                Status = UserStatus.Active,
                CreatedAt = DateTime.Now
            };

        // Helper method to create test roles
        private List<Role> CreateTestRoles()
            => new()
            {
                new Role { Id = 1, RoleName = "Examinee" }
            };

        // UTCID01: User tồn tại - trả về Success với đầy đủ thông tin user và roles
        [Trait("Category", "GetUserByIdAsync")]
        [Trait("TestCase", "UTCID01")]
        [Fact]
        public async Task GetUserByIdAsync_UserExists_ReturnsSuccessWithUserData()
        {
            // Arrange
            var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var user = CreateTestUser(userId, "examinee@toeicgenius.com", "Nguyen Van A");
            var roles = CreateTestRoles();

            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId)).ReturnsAsync(user);
            _unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(userId)).ReturnsAsync(roles);

            var service = CreateService();

            // Act
            var result = await service.GetUserByIdAsync(userId);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Id.Should().Be(userId);
            result.Data.Email.Should().Be("examinee@toeicgenius.com");
            result.Data.FullName.Should().Be("Nguyen Van A");
            result.Data.Status.Should().Be(UserStatus.Active);
            result.Data.Roles.Should().HaveCount(1);
            result.Data.Roles.Should().Contain("Examinee");
            result.Data.CreatedAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));

            _unitOfWorkMock.Verify(u => u.Users.GetByIdAsync(userId), Times.Once);
            _unitOfWorkMock.Verify(u => u.Roles.GetRolesByUserIdAsync(userId), Times.Once);
        }

        // UTCID02: User không tồn tại - trả về Failure với UserNotFound
        [Trait("Category", "GetUserByIdAsync")]
        [Trait("TestCase", "UTCID02")]
        [Fact]
        public async Task GetUserByIdAsync_UserNotFound_ReturnsUserNotFound()
        {
            // Arrange
            var userId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId)).ReturnsAsync((User)null!);

            var service = CreateService();

            // Act
            var result = await service.GetUserByIdAsync(userId);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.UserNotFound);
            result.Data.Should().BeNull();

            _unitOfWorkMock.Verify(u => u.Users.GetByIdAsync(userId), Times.Once);
            _unitOfWorkMock.Verify(u => u.Roles.GetRolesByUserIdAsync(It.IsAny<Guid>()), Times.Never);
        }

        // UTCID03: Guid id rỗng (Guid.Empty) - trả về Failure với UserNotFound
        [Trait("Category", "GetUserByIdAsync")]
        [Trait("TestCase", "UTCID03")]
        [Fact]
        public async Task GetUserByIdAsync_EmptyGuid_ReturnsUserNotFound()
        {
            // Arrange
            var emptyGuid = Guid.Empty;
            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(emptyGuid)).ReturnsAsync((User)null!);

            var service = CreateService();

            // Act
            var result = await service.GetUserByIdAsync(emptyGuid);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.UserNotFound);
            result.Data.Should().BeNull();

            _unitOfWorkMock.Verify(u => u.Users.GetByIdAsync(emptyGuid), Times.Once);
        }

        // UTCID04: Lỗi hệ thống exception - trả về Failure với OperationFailed
        [Trait("Category", "GetUserByIdAsync")]
        [Trait("TestCase", "UTCID04")]
        [Fact]
        public async Task GetUserByIdAsync_ExceptionThrown_ReturnsOperationFailed()
        {
            // Arrange
            var userId = Guid.Parse("33333333-3333-3333-3333-333333333333");
            var exceptionMessage = "Database connection failed";
            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId))
                .ThrowsAsync(new Exception(exceptionMessage));

            var service = CreateService();

            // Act
            var result = await service.GetUserByIdAsync(userId);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Contain(ErrorMessages.OperationFailed);
            result.ErrorMessage.Should().Contain(exceptionMessage);
            result.Data.Should().BeNull();

            _unitOfWorkMock.Verify(u => u.Users.GetByIdAsync(userId), Times.Once);
        }
        #endregion

        #region 2. UserService_UpdateStatus Tests

        // UTCID01: Cập nhật status thành Active - trả về Success
        [Trait("Category", "UpdateStatus")]
        [Trait("TestCase", "UTCID01")]
        [Fact]
        public async Task UpdateStatus_ToActive_ReturnsSuccess()
        {
            // Arrange
            var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var user = CreateTestUser(userId, "user@example.com", "Test User");
            user.Status = UserStatus.Banned; // Current status

            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId)).ReturnsAsync(user);
            _unitOfWorkMock.Setup(u => u.Users.UpdateAsync(user))
                .ReturnsAsync(user); // Trả về chính user
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
                .ReturnsAsync(1); // Trả về 1, giả lập đã save 1 record

            var service = CreateService();

            // Act
            var result = await service.UpdateStatus(userId, UserStatus.Active);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().Be(SuccessMessages.UserStatusUpdated);
            user.Status.Should().Be(UserStatus.Active);
        }

        // UTCID02: Cập nhật status thành Banned - trả về Success
        [Trait("Category", "UpdateStatus")]
        [Trait("TestCase", "UTCID02")]
        [Fact]
        public async Task UpdateStatus_ToBanned_ReturnsSuccess()
        {
            // Arrange
            var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var user = CreateTestUser(userId, "user@example.com", "Test User");
            user.Status = UserStatus.Active; // Current status

            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId)).ReturnsAsync(user);
            _unitOfWorkMock.Setup(u => u.Users.UpdateAsync(user))
                .ReturnsAsync(user); // Trả về chính user
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
                .ReturnsAsync(1); // Trả về 1, giả lập đã save 1 record

            var service = CreateService();

            // Act
            var result = await service.UpdateStatus(userId, UserStatus.Banned);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().Be(SuccessMessages.UserStatusUpdated);
            user.Status.Should().Be(UserStatus.Banned);
        }

        // UTCID03: Cập nhật status thành Deleted - trả về Success
        [Trait("Category", "UpdateStatus")]
        [Trait("TestCase", "UTCID03")]
        [Fact]
        public async Task UpdateStatus_ToDeleted_ReturnsSuccess()
        {
            // Arrange
            var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var user = CreateTestUser(userId, "user@example.com", "Test User");
            user.Status = UserStatus.Active; // Current status

            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId)).ReturnsAsync(user);
            _unitOfWorkMock.Setup(u => u.Users.UpdateAsync(user))
                .ReturnsAsync(user); // Trả về chính user
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync())
                .ReturnsAsync(1); // Trả về 1, giả lập đã save 1 record

            var service = CreateService();

            // Act
            var result = await service.UpdateStatus(userId, UserStatus.Deleted);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().Be(SuccessMessages.UserStatusUpdated);
            user.Status.Should().Be(UserStatus.Deleted);
        }

        // UTCID04: User không tồn tại - trả về UserNotFound
        [Trait("Category", "UpdateStatus")]
        [Trait("TestCase", "UTCID04")]
        [Fact]
        public async Task UpdateStatus_UserNotFound_ReturnsUserNotFound()
        {
            // Arrange
            var userId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId)).ReturnsAsync((User)null!);

            var service = CreateService();

            // Act
            var result = await service.UpdateStatus(userId, UserStatus.Active);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.UserNotFound);
            result.Data.Should().BeNull();
        }

        // UTCID05: Guid rỗng - trả về UserNotFound
        [Trait("Category", "UpdateStatus")]
        [Trait("TestCase", "UTCID05")]
        [Fact]
        public async Task UpdateStatus_EmptyGuid_ReturnsUserNotFound()
        {
            // Arrange
            var emptyGuid = Guid.Empty;
            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(emptyGuid)).ReturnsAsync((User)null!);

            var service = CreateService();

            // Act
            var result = await service.UpdateStatus(emptyGuid, UserStatus.Active);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.UserNotFound);
            result.Data.Should().BeNull();
        }

        // UTCID06: Exception xảy ra - trả về OperationFailed
        [Trait("Category", "UpdateStatus")]
        [Trait("TestCase", "UTCID06")]
        [Fact]
        public async Task UpdateStatus_ExceptionThrown_ReturnsOperationFailed()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var exceptionMessage = "Database update failed";
            _unitOfWorkMock.Setup(u => u.Users.GetByIdAsync(userId))
                .ThrowsAsync(new Exception(exceptionMessage));

            var service = CreateService();

            // Act
            var result = await service.UpdateStatus(userId, UserStatus.Active);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Contain(ErrorMessages.OperationFailed);
            result.ErrorMessage.Should().Contain(exceptionMessage);
            result.Data.Should().BeNull();
        }

        #endregion

        #region 3. UserService_CreateUserAsync Tests

        // Helper method to create CreateUserDto
        private CreateUserDto CreateUserDto(string email = "newuser@gmail.com", string fullName = "New User", string? password = "Password123", List<string>? roles = null)
            => new()
            {
                Email = email,
                FullName = fullName,
                Password = password!,
                Roles = roles
            };

        // UTCID01: Email đã tồn tại - trả về EmailAlreadyExists
        [Trait("Category", "CreateUserAsync")]
        [Trait("TestCase", "UTCID01")]
        [Fact]
        public async Task CreateUserAsync_EmailAlreadyExists_ReturnsEmailAlreadyExists()
        {
            // Arrange
            var dto = CreateUserDto(email:"exist@gmail.com");
            var existingUser = CreateTestUser(Guid.NewGuid(), dto.Email, "Existing User");

            _unitOfWorkMock.Setup(u => u.Users.GetByEmailAsync(dto.Email)).ReturnsAsync(existingUser);

            var service = CreateService();

            // Act
            var result = await service.CreateUserAsync(dto);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Be(ErrorMessages.EmailAlreadyExists);
            result.Data.Should().BeNull();

            _unitOfWorkMock.Verify(u => u.Users.GetByEmailAsync(dto.Email), Times.Once);
            _unitOfWorkMock.Verify(u => u.Users.AddAsync(It.IsAny<User>()), Times.Never);
        }

        // UTCID02: Tạo user thành công với password được cung cấp và có roles
        [Trait("Category", "CreateUserAsync")]
        [Trait("TestCase", "UTCID02")]
        [Fact]
        public async Task CreateUserAsync_WithProvidedPasswordAndRoles_ReturnsSuccess()
        {
            // Arrange
            var roles = new List<string> { "Admin", "TestCreator" };
            var dto = CreateUserDto(password: "MyPassword123", roles: roles);
            var roleEntities = new List<Role>
            {
                new Role { Id = 1, RoleName = "Admin" },
                new Role { Id = 2, RoleName = "TestCreator" }
            };

            _unitOfWorkMock.Setup(u => u.Users.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);
            _unitOfWorkMock.Setup(u => u.Users.AddAsync(It.IsAny<User>())).ReturnsAsync(It.IsAny<User>());
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            _unitOfWorkMock.Setup(u => u.Roles.GetRolesByNamesAsync(roles)).ReturnsAsync(roleEntities);
            _unitOfWorkMock.Setup(u => u.Users.UpdateAsync(It.IsAny<User>())).ReturnsAsync(It.IsAny<User>());
            _unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(roleEntities);
            _emailServiceMock.Setup(e => e.SendMail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            var result = await service.CreateUserAsync(dto);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Email.Should().Be(dto.Email);
            result.Data.FullName.Should().Be(dto.FullName);
            result.Data.Status.Should().Be(UserStatus.Active);
            result.Data.Roles.Should().HaveCount(2);
            result.Data.Roles.Should().Contain("Admin");
            result.Data.Roles.Should().Contain("TestCreator");

            _unitOfWorkMock.Verify(u => u.Users.AddAsync(It.IsAny<User>()), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.AtLeast(2)); // Once after AddAsync, once after UpdateAsync
            _unitOfWorkMock.Verify(u => u.Roles.GetRolesByNamesAsync(roles), Times.Once);
            _unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Once);
            _emailServiceMock.Verify(e => e.SendMail(dto.Email, It.IsAny<string>(), It.Is<string>(body => body.Contains("MyPassword123"))), Times.Once);
        }

        // UTCID03: Tạo user với password tự động sinh (null/empty) - trả về Success
        [Trait("Category", "CreateUserAsync")]
        [Trait("TestCase", "UTCID03")]
        [Fact]
        public async Task CreateUserAsync_WithAutoGeneratedPassword_ReturnsSuccess()
        {
            // Arrange
            var dto = CreateUserDto(password: null); // Password will be auto-generated
            var roleEntities = new List<Role>
            {
                new Role { Id = 2, RoleName = "TestCreator" }
            };

            _unitOfWorkMock.Setup(u => u.Users.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);
            _unitOfWorkMock.Setup(u => u.Users.AddAsync(It.IsAny<User>())).ReturnsAsync(It.IsAny<User>());
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            _unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(roleEntities);
            _emailServiceMock.Setup(e => e.SendMail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            var result = await service.CreateUserAsync(dto);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Email.Should().Be(dto.Email);
            result.Data.FullName.Should().Be(dto.FullName);

            // Verify email was sent with auto-generated password (not null)
            _emailServiceMock.Verify(e => e.SendMail(
                dto.Email,
                It.IsAny<string>(),
                It.Is<string>(body => !string.IsNullOrEmpty(body))), Times.Once);
        }

        // UTCID04: Tạo user không có roles - trả về Success
        [Trait("Category", "CreateUserAsync")]
        [Trait("TestCase", "UTCID04")]
        [Fact]
        public async Task CreateUserAsync_WithoutRoles_ReturnsSuccess()
        {
            // Arrange
            var dto = CreateUserDto(roles: null); // No roles
            var emptyRoles = new List<Role>();

            _unitOfWorkMock.Setup(u => u.Users.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);
            _unitOfWorkMock.Setup(u => u.Users.AddAsync(It.IsAny<User>())).ReturnsAsync(It.IsAny<User>());
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            _unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(emptyRoles);
            _emailServiceMock.Setup(e => e.SendMail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            var result = await service.CreateUserAsync(dto);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Email.Should().Be(dto.Email);
            result.Data.Roles.Should().BeEmpty();

            _unitOfWorkMock.Verify(u => u.Users.AddAsync(It.IsAny<User>()), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once); // Only once, no role assignment
            _unitOfWorkMock.Verify(u => u.Roles.GetRolesByNamesAsync(It.IsAny<List<string>>()), Times.Never);
            _unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
        }

        // UTCID05: Tạo user với empty roles list - trả về Success (không assign roles)
        [Trait("Category", "CreateUserAsync")]
        [Trait("TestCase", "UTCID05")]
        [Fact]
        public async Task CreateUserAsync_WithEmptyRolesList_ReturnsSuccess()
        {
            // Arrange
            var dto = CreateUserDto(roles: new List<string>()); // Empty list
            var emptyRoles = new List<Role>();

            _unitOfWorkMock.Setup(u => u.Users.GetByEmailAsync(dto.Email)).ReturnsAsync((User)null!);
            _unitOfWorkMock.Setup(u => u.Users.AddAsync(It.IsAny<User>())).ReturnsAsync(It.IsAny<User>());
            _unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            _unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(It.IsAny<Guid>())).ReturnsAsync(emptyRoles);
            _emailServiceMock.Setup(e => e.SendMail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);

            var service = CreateService();

            // Act
            var result = await service.CreateUserAsync(dto);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.Roles.Should().BeEmpty();

            // Verify roles assignment was skipped
            _unitOfWorkMock.Verify(u => u.Roles.GetRolesByNamesAsync(It.IsAny<List<string>>()), Times.Never);
            _unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once); // Only once for user creation
        }

        #endregion

        #region 4. UserService_GetUsersAsync Tests

        // Helper method to create UserResponseDto list
        private List<UserResponseDto> CreateUserResponseDtoList(int count = 3)
        {
            var users = new List<UserResponseDto>();
            for (int i = 1; i <= count; i++)
            {
                users.Add(new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = $"user{i}@example.com",
                    FullName = $"User {i}",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = DateTime.Now.AddDays(-i)
                });
            }
            return users;
        }

        // Helper method to create PaginationResponse
        private PaginationResponse<UserResponseDto> CreatePaginationResponse(List<UserResponseDto> users, int totalCount, int page = 1, int pageSize = 6)
        {
            return new PaginationResponse<UserResponseDto>(users, totalCount, page, pageSize);
        }

        // UTCID01: Lấy danh sách users thành công với pagination mặc định
        // Expected: PaginationResponse<UserResponseDto> with 6 elements, with SortBy CreatedAt, SortOrder Desc
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID01")]
        [Fact]
        public async Task GetUsersAsync_DefaultPagination_ReturnsSuccessWithPaginatedUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                SortBy = "CreatedAt",
                SortOrder = SortOrder.Desc,
                PageSize = 6
            };
            var users = CreateUserResponseDtoList(6);
            var paginationResponse = CreatePaginationResponse(users, 6, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(6);
            result.Data.PageSize.Should().Be(6);
        }

        // UTCID02: Lấy danh sách users: SortBy CreatedAt, SortOrder Asc
        // Expected: PaginationResponse<UserResponseDto> with 6 elements, sorted by CreatedAt ascending
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID02")]
        [Fact]
        public async Task GetUsersAsync_WithFilters_ReturnsFilteredUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                SortBy = "CreatedAt",
                SortOrder = SortOrder.Asc,
                PageSize = 6
            };
            var users = CreateUserResponseDtoList(6);
            var paginationResponse = CreatePaginationResponse(users, 6, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(6);
            result.Data.PageSize.Should().Be(6);
        }

        // UTCID03: Lấy danh sách users: SortBy FullName, SortOrder Desc, PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 6 elements, sort by FullName descending
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID03")]
        [Fact]
        public async Task GetUsersAsync_SortByFullNameDesc_ReturnsSortedUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                SortBy = "fullname",
                SortOrder = SortOrder.Desc,
                PageSize = 6
            };
            var users = CreateUserResponseDtoList(6);
            var paginationResponse = CreatePaginationResponse(users, 6, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(6);
            result.Data.PageSize.Should().Be(6);
        }

        // UTCID04: Lấy danh sách users: SortBy FullName, SortOrder Asc, PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 6 elements, sort by FullName ascending
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID04")]
        [Fact]
        public async Task GetUsersAsync_SortByFullNameAsc_ReturnsSortedUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                SortBy = "fullname",
                SortOrder = SortOrder.Asc,
                PageSize = 6
            };
            var users = CreateUserResponseDtoList(6);
            var paginationResponse = CreatePaginationResponse(users, 6, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(6);
            result.Data.PageSize.Should().Be(6);
        }

        // UTCID05: Lấy danh sách users: SortBy Status, SortOrder Desc, PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 6 elements, sort by Status descending
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID05")]
        [Fact]
        public async Task GetUsersAsync_SortByStatusDesc_ReturnsSortedUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                SortBy = "status",
                SortOrder = SortOrder.Desc,
                PageSize = 6
            };
            var users = CreateUserResponseDtoList(6);
            var paginationResponse = CreatePaginationResponse(users, 6, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(6);
            result.Data.PageSize.Should().Be(6);
        }

        // UTCID06: Lấy danh sách users: SortBy Status, SortOrder Asc, PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 6 elements, sort by Status ascending
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID06")]
        [Fact]
        public async Task GetUsersAsync_SortByStatusAsc_ReturnsSortedUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                SortBy = "Status",
                SortOrder = SortOrder.Asc,
                PageSize = 6
            };
            var users = CreateUserResponseDtoList(6);
            var paginationResponse = CreatePaginationResponse(users, 6, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(6);
            result.Data.PageSize.Should().Be(6);
        }

        // UTCID07: Lấy danh sách users: PageSize = 10
        // Expected: PaginationResponse<UserResponseDto> with 10 elements, sort by CreatedAt descending
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID07")]
        [Fact]
        public async Task GetUsersAsync_PageSize10_Returns10Users()
        {
            // Arrange
            var request = new UserResquestDto
            {
                PageSize = 10
            };
            var users = new List<UserResponseDto>();
            for (int i = 1; i <= 10; i++)
            {
                users.Add(new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = $"user{i}@example.com",
                    FullName = $"User {i}",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = DateTime.Now.AddDays(-i)
                });
            }
            var paginationResponse = CreatePaginationResponse(users, 10, 1, 10);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(10);
            result.Data.PageSize.Should().Be(10);
            result.Data.TotalCount.Should().Be(10);

            _unitOfWorkMock.Verify(u => u.Users.GetUsersAsync(It.Is<UserResquestDto>(r =>
                r.PageSize == 10)), Times.Once);
        }

        // UTCID08: Lấy danh sách users: KeyWord = "Nguyen Van A", PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 2 elements, each element has FullName is "Nguyen Van A", different email
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID08")]
        [Fact]
        public async Task GetUsersAsync_KeywordNguyenVanA_ReturnsMatchingUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                Keyword = "Nguyen Van A",
                PageSize = 6
            };
            var users = new List<UserResponseDto>
            {
                new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = "nguyenvana1@example.com",
                    FullName = "Nguyen Van A",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = DateTime.Now.AddDays(-1)
                },
                new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = "nguyenvana2@example.com",
                    FullName = "Nguyen Van A",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = DateTime.Now.AddDays(-2)
                }
            };
            var paginationResponse = CreatePaginationResponse(users, 2, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(2);
            result.Data.DataPaginated.Should().OnlyContain(u => u.FullName == "Nguyen Van A");
            result.Data.DataPaginated.Select(u => u.Email).Should().OnlyHaveUniqueItems();
        }

        // UTCID09: Lấy danh sách users: KeyWord = "user@gmail.com", PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 1 element, with Email is "user@gmail.com"
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID09")]
        [Fact]
        public async Task GetUsersAsync_KeywordEmail_ReturnsMatchingUser()
        {
            // Arrange
            var request = new UserResquestDto
            {
                Keyword = "user@gmail.com",
                PageSize = 6
            };
            var users = new List<UserResponseDto>
            {
                new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = "user@gmail.com",
                    FullName = "Test User",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = DateTime.Now
                }
            };
            var paginationResponse = CreatePaginationResponse(users, 1, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(1);
            result.Data.DataPaginated.First().Email.Should().Be("user@gmail.com");

            _unitOfWorkMock.Verify(u => u.Users.GetUsersAsync(It.Is<UserResquestDto>(r =>
                r.Keyword == "user@gmail.com" &&
                r.PageSize == 6)), Times.Once);
        }

        // UTCID10: Lấy danh sách users: Role = "TestCreator", PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 3 elements, each element has Role "TestCreator"
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID10")]
        [Fact]
        public async Task GetUsersAsync_RoleTestCreator_ReturnsUsersWithRole()
        {
            // Arrange
            var request = new UserResquestDto
            {
                Role = "TestCreator",
                PageSize = 6
            };
            var users = new List<UserResponseDto>();
            for (int i = 1; i <= 3; i++)
            {
                users.Add(new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = $"creator{i}@example.com",
                    FullName = $"Creator {i}",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "TestCreator" },
                    CreatedAt = DateTime.Now.AddDays(-i)
                });
            }
            var paginationResponse = CreatePaginationResponse(users, 3, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(3);
            result.Data.DataPaginated.Should().OnlyContain(u => u.Roles.Contains("TestCreator"));
        }

        // UTCID11: Lấy danh sách users: Role = "Examinee", PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 3 elements, each element has Role "Examinee"
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID11")]
        [Fact]
        public async Task GetUsersAsync_RoleExaminee_ReturnsUsersWithRole()
        {
            // Arrange
            var request = new UserResquestDto
            {
                Role = "Examinee",
                PageSize = 6
            };
            var users = new List<UserResponseDto>();
            for (int i = 1; i <= 3; i++)
            {
                users.Add(new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = $"examinee{i}@example.com",
                    FullName = $"Examinee {i}",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = DateTime.Now.AddDays(-i)
                });
            }
            var paginationResponse = CreatePaginationResponse(users, 3, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(3);
            result.Data.DataPaginated.Should().OnlyContain(u => u.Roles.Contains("Examinee"));
        }

        // UTCID12: Lấy danh sách users: Status = "Active", PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 6 elements, total 10 elements, each element has Status "Active"
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID12")]
        [Fact]
        public async Task GetUsersAsync_StatusActive_ReturnsActiveUsers()
        {
            // Arrange
            var request = new UserResquestDto
            {
                Status = UserStatus.Active,
                PageSize = 6
            };
            var users = new List<UserResponseDto>();
            for (int i = 1; i <= 6; i++)
            {
                users.Add(new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = $"active{i}@example.com",
                    FullName = $"Active User {i}",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = DateTime.Now.AddDays(-i)
                });
            }
            var paginationResponse = CreatePaginationResponse(users, 10, 1, 6); // Total 10, showing 6

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(6);
            result.Data.TotalCount.Should().Be(10);
            result.Data.DataPaginated.Should().OnlyContain(u => u.Status == UserStatus.Active);

        }

        // UTCID13: Lấy danh sách users: CreatedAt nằm trong khoảng 10/11/2025 -> 12/11/2025, PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 2 elements, each element has CreatedAt in the range
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID13")]
        [Fact]
        public async Task GetUsersAsync_DateRangeFilter_ReturnsUsersInRange()
        {
            // Arrange
            var fromDate = new DateTime(2025, 11, 10);
            var toDate = new DateTime(2025, 11, 12);
            var request = new UserResquestDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                PageSize = 6
            };
            var users = new List<UserResponseDto>
            {
                new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = "user1@example.com",
                    FullName = "User 1",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = new DateTime(2025, 11, 10, 10, 0, 0)
                },
                new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = "user2@example.com",
                    FullName = "User 2",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = new DateTime(2025, 11, 11, 15, 30, 0)
                }
            };
            var paginationResponse = CreatePaginationResponse(users, 2, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(2);
            result.Data.DataPaginated.Should().OnlyContain(u =>
                u.CreatedAt >= fromDate && u.CreatedAt <= toDate);
        }

        // UTCID14: Lấy danh sách users: FullName = "Nguyen Van A", Role = "Examinee", Status = "Active", CreatedAt nằm trong khoảng 10/11/2025 -> 12/11/2025, PageSize = 6
        // Expected: PaginationResponse<UserResponseDto> with 1 element, matching all criteria
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID14")]
        [Fact]
        public async Task GetUsersAsync_CombinedFilters_ReturnsMatchingUser()
        {
            // Arrange
            var fromDate = new DateTime(2025, 11, 10);
            var toDate = new DateTime(2025, 11, 12);
            var request = new UserResquestDto
            {
                Keyword = "Nguyen Van A",
                Role = "Examinee",
                Status = UserStatus.Active,
                FromDate = fromDate,
                ToDate = toDate,
                PageSize = 6
            };
            var users = new List<UserResponseDto>
            {
                new UserResponseDto
                {
                    Id = Guid.NewGuid(),
                    Email = "nguyenvana@example.com",
                    FullName = "Nguyen Van A",
                    Status = UserStatus.Active,
                    Roles = new List<string> { "Examinee" },
                    CreatedAt = new DateTime(2025, 11, 11, 10, 0, 0)
                }
            };
            var paginationResponse = CreatePaginationResponse(users, 1, 1, 6);

            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ReturnsAsync(paginationResponse);

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();
            result.Data!.DataPaginated.Should().HaveCount(1);

            var user = result.Data.DataPaginated.First();
            user.FullName.Should().Be("Nguyen Van A");
            user.Roles.Should().Contain("Examinee");
            user.Status.Should().Be(UserStatus.Active);
            user.CreatedAt.Should().BeOnOrAfter(fromDate).And.BeOnOrBefore(toDate);
        }

        // UTCID15: Lấy danh sách users: lỗi -> trả ra exception
        [Trait("Category", "GetUsersAsync")]
        [Trait("TestCase", "UTCID15")]
        [Fact]
        public async Task GetUsersAsync_ExceptionThrown_ReturnsOperationFailed()
        {
            // Arrange
            var request = new UserResquestDto();
            var exceptionMessage = "Database connection timeout";
            _unitOfWorkMock.Setup(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()))
                .ThrowsAsync(new Exception(exceptionMessage));

            var service = CreateService();

            // Act
            var result = await service.GetUsersAsync(request);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.ErrorMessage.Should().Contain(ErrorMessages.OperationFailed);
            result.ErrorMessage.Should().Contain(exceptionMessage);
            result.Data.Should().BeNull();

            _unitOfWorkMock.Verify(u => u.Users.GetUsersAsync(It.IsAny<UserResquestDto>()), Times.Once);
        }

        #endregion

		#region 5. UserService_UpdateUserAsync Tests

		// Helper method to create UpdateUserDto
		private UpdateUserDto CreateUpdateUserDto(string fullName = "Updated Name", string? password = null, List<string>? roles = null)
			=> new()
			{
				FullName = fullName,
				Password = password,
				Roles = roles
			};

		// Helper method to create User with Roles
		private User CreateUserWithRoles(Guid userId, List<Role> roles)
		{
			var user = CreateTestUser(userId);
			user.Roles = roles;
			return user;
		}

		// UTCID01: User không tồn tại - trả về UserNotFound
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID01")]
		[Fact]
		public async Task UpdateUserAsync_UserNotFound_ReturnsUserNotFound()
		{
			// Arrange
			var userId = Guid.Parse("22222222-2222-2222-2222-222222222222");
			var dto = CreateUpdateUserDto();

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync((User)null!);

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be(ErrorMessages.UserNotFound);
			result.Data.Should().BeNull();

			_unitOfWorkMock.Verify(u => u.Users.GetUserAndRoleByUserIdAsync(userId), Times.Once);
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
		}

		// UTCID02: Cập nhật thông tin cơ bản (chỉ FullName, không có password và roles) - Success
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID02")]
		[Fact]
		public async Task UpdateUserAsync_BasicInfoOnly_ReturnsSuccess()
		{
			// Arrange
			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var existingRoles = new List<Role> { new Role { Id = 1, RoleName = "Examinee" } };
			var user = CreateUserWithRoles(userId, existingRoles);
			var dto = CreateUpdateUserDto(fullName: "New Full Name");

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.Users.UpdateAsync(user)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(userId)).ReturnsAsync(existingRoles);

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();
			result.Data!.FullName.Should().Be("New Full Name");
			result.Data.Roles.Should().HaveCount(1);
			result.Data.Roles.Should().Contain("Examinee");

			user.FullName.Should().Be("New Full Name");
			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(user), Times.Once);
			_unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
		}

		// UTCID03: Cập nhật với password hợp lệ - Success
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID03")]
		[Fact]
		public async Task UpdateUserAsync_WithValidPassword_ReturnsSuccess()
		{
			// Arrange
			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var user = CreateUserWithRoles(userId, new List<Role>());
			var dto = CreateUpdateUserDto(password: "NewPassword123");

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.Users.UpdateAsync(user)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(userId)).ReturnsAsync(new List<Role>());

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();

			// Verify password was hashed (not the plain password)
			user.PasswordHash.Should().NotBe("NewPassword123");
			user.PasswordHash.Should().NotBeNullOrEmpty();
		}

		// UTCID04: Cập nhật với password không đủ độ dài - Returns validation error
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID04")]
		[Fact]
		public async Task UpdateUserAsync_WithInvalidPassword_ReturnsValidationError()
		{
			// Arrange
			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var user = CreateUserWithRoles(userId, new List<Role>());
			var dto = CreateUpdateUserDto(password: "123"); // Too short, invalid

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync(user);

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be(ErrorMessages.PasswordMinLength);
			result.Data.Should().BeNull();

			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
		}

		// UTCID05: Password không thỏa regex - Returns validation error
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID05")]
		[Fact]
		public async Task UpdateUserAsync_InvalidPassword_ReturnsValidationError()
		{
			// Arrange
			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var user = CreateUserWithRoles(userId, new List<Role>());
			var dto = CreateUpdateUserDto(password: "12345678"); // Too short, invalid

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync(user);

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be(ErrorMessages.PasswordInvalidRegex);
			result.Data.Should().BeNull();

			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
		}

		// UTCID06: Cập nhật roles - xóa roles cũ - Success
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID06")]
		[Fact]
		public async Task UpdateUserAsync_RemoveOldRoles_ReturnsSuccess()
		{
			// Arrange
			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var existingRoles = new List<Role>
			{
				new Role { Id = 1, RoleName = "Examinee" },
				new Role { Id = 2, RoleName = "TestCreator" }
			};
			var user = CreateUserWithRoles(userId, existingRoles);

			var newRoles = new List<string> { "Examinee" }; // Remove TestCreator
			var dto = CreateUpdateUserDto(roles: newRoles);

			var validRoles = new List<Role>
			{
				new Role { Id = 1, RoleName = "Examinee" }
			};

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.Roles.GetRolesByNamesAsync(newRoles)).ReturnsAsync(validRoles);
			_unitOfWorkMock.Setup(u => u.Users.UpdateAsync(user)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(userId)).ReturnsAsync(validRoles);

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();
			result.Data!.Roles.Should().HaveCount(1);
			result.Data.Roles.Should().Contain("Examinee");
			result.Data.Roles.Should().NotContain("TestCreator");
		}

		// UTCID07: Cập nhật roles - success
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID07")]
		[Fact]
		public async Task UpdateUserAsync_ReplaceAllRoles_ReturnsSuccess()
		{
			// Arrange
			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var existingRoles = new List<Role> { new Role { Id = 1, RoleName = "Examinee" } };
			var user = CreateUserWithRoles(userId, existingRoles);

			var newRoles = new List<string> { "Admin" }; // Completely different role
			var dto = CreateUpdateUserDto(roles: newRoles);

			var validRoles = new List<Role>
			{
				new Role { Id = 3, RoleName = "Admin" }
			};

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.Roles.GetRolesByNamesAsync(newRoles)).ReturnsAsync(validRoles);
			_unitOfWorkMock.Setup(u => u.Users.UpdateAsync(user)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
			_unitOfWorkMock.Setup(u => u.Roles.GetRolesByUserIdAsync(userId)).ReturnsAsync(validRoles);

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeTrue();
			result.Data.Should().NotBeNull();
			result.Data!.Roles.Should().HaveCount(1);
			result.Data.Roles.Should().Contain("Admin");
			result.Data.Roles.Should().NotContain("Examinee");
		}

		// UTCID08: Cập nhật với roles không hợp lệ - Returns "No valid roles found"
		[Trait("Category", "UpdateUserAsync")]
		[Trait("TestCase", "UTCID08")]
		[Fact]
		public async Task UpdateUserAsync_WithInvalidRoles_ReturnsNoValidRolesError()
		{
			// Arrange
			var userId = Guid.Parse("11111111-1111-1111-1111-111111111111");
			var user = CreateUserWithRoles(userId, new List<Role>());
			var dto = CreateUpdateUserDto(roles: new List<string> { "InvalidRole" });

			_unitOfWorkMock.Setup(u => u.Users.GetUserAndRoleByUserIdAsync(userId)).ReturnsAsync(user);
			_unitOfWorkMock.Setup(u => u.Roles.GetRolesByNamesAsync(It.IsAny<List<string>>()))
				.ReturnsAsync(new List<Role>()); // No valid roles found

			var service = CreateService();

			// Act
			var result = await service.UpdateUserAsync(userId, dto);

			// Assert
			result.IsSuccess.Should().BeFalse();
			result.ErrorMessage.Should().Be("No valid roles found.");
			result.Data.Should().BeNull();

			_unitOfWorkMock.Verify(u => u.Users.UpdateAsync(It.IsAny<User>()), Times.Never);
		}

		#endregion
    }
}
