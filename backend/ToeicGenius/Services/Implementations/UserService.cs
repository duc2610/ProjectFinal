using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Shared.Helpers;

namespace ToeicGenius.Services.Implementations
{
	public class UserService : IUserService
	{
		private readonly IUnitOfWork _uow;
		private readonly IEmailService _emailService;

		public UserService(IUnitOfWork unitOfWork, IEmailService emailService)
		{
			_uow = unitOfWork;
			_emailService = emailService;
		}

		public async Task<Result<string>> UpdateStatus(Guid userId, UserStatus userStatus)
		{
			var user = await _uow.Users.GetByIdAsync(userId);
			if (user == null)
			{
				return Result<string>.Failure(ErrorMessages.UserNotFound);
			}
			user.Status = userStatus;
			await _uow.Users.UpdateAsync(user);
			await _uow.SaveChangesAsync();
			return Result<string>.Success(SuccessMessages.UserStatusUpdated);
		}

		public async Task<Result<UserResponseDto?>> GetUserByIdAsync(Guid userId)
		{
			var user = await _uow.Users.GetByIdAsync(userId);
			if (user == null)
			{
				return Result<UserResponseDto>.Failure(ErrorMessages.UserNotFound);
			}
			var roles = await _uow.Roles.GetRolesByUserIdAsync(userId);
			var result = new UserResponseDto
			{
				Id = userId,
				Email = user.Email,
				FullName = user.FullName,
				CreatedAt = user.CreatedAt,
				Status = user.Status,
				Roles = roles.Select(x => x.RoleName).ToList(),
			};

			return Result<UserResponseDto>.Success(result);
		}

		// Get list user with filters
		public async Task<Result<PaginationResponse<UserResponseDto>>> GetUsersAsync(UserResquestDto request)
		{
			var result = await _uow.Users.GetUsersAsync(request);
			return Result<PaginationResponse<UserResponseDto>>.Success(result);
		}

		// Get statistic (about user)
		public async Task<Result<UserStatisticsResponseDto>> GetUserStatisticsAsync()
		{

			var result = new UserStatisticsResponseDto
			{
				TotalUsers = await _uow.Users.CountTotalUsersAsync(),
				ActiveUsers = await _uow.Users.CountActiveUsersAsync(),
				BannedUsers = await _uow.Users.CountBannedUsersAsync(),
				NewUsersThisWeek = await _uow.Users.CountNewUsersThisWeekAsync(),
				NewUsersThisMonth = await _uow.Users.CountNewUsersThisMonthAsync()
			};
			return Result<UserStatisticsResponseDto>.Success(result);
		}

		public async Task<Result<UserResponseDto>> CreateUserAsync(CreateUserDto dto)
		{
			var existing = await _uow.Users.GetByEmailAsync(dto.Email);
			if (existing != null)
			{
				return Result<UserResponseDto>.Failure(ErrorMessages.EmailAlreadyExists);
			}

			// Gen password random 
			var plainPassword = string.IsNullOrWhiteSpace(dto.Password) ? GenerateTemporaryPassword() : dto.Password!;

			var user = new User
			{
				Id = Guid.NewGuid(),
				Email = dto.Email,
				FullName = dto.FullName,
				PasswordHash = SecurityHelper.HashPassword(plainPassword),
				Status = UserStatus.Active,
				CreatedAt = DateTime.UtcNow
			};

			await _uow.Users.AddAsync(user);
			await _uow.SaveChangesAsync();

			// Assign roles if provided
			if (dto.Roles != null && dto.Roles.Count > 0)
			{
				var rolesToAssign = await _uow.Roles.GetRolesByNamesAsync(dto.Roles);
				user.Roles = rolesToAssign;
				await _uow.Users.UpdateAsync(user);
				await _uow.SaveChangesAsync();
			}

			var (subject, body) = EmailTemplates.BuildAccountCreatedEmail(user.FullName, user.Email, plainPassword);

			await _emailService.SendMail(user.Email, subject, body);

			var roles = await _uow.Roles.GetRolesByUserIdAsync(user.Id);
			var response = new UserResponseDto
			{
				Id = user.Id,
				Email = user.Email,
				FullName = user.FullName,
				Status = user.Status,
				CreatedAt = user.CreatedAt,
				Roles = roles.Select(r => r.RoleName).ToList()
			};

			return Result<UserResponseDto>.Success(response);
		}

		public async Task<Result<UserResponseDto>> UpdateUserAsync(Guid userId, UpdateUserDto dto)
		{
			var user = await _uow.Users.GetUserAndRoleByUserIdAsync(userId);
			if (user == null)
				return Result<UserResponseDto>.Failure(ErrorMessages.UserNotFound);

			// Cập nhật thông tin cơ bản
			user.FullName = dto.FullName;
			user.UpdatedAt = DateTime.UtcNow;

			// Cập nhật mật khẩu nếu có
			if (!string.IsNullOrWhiteSpace(dto.Password))
			{
				var (isValid, error) = SecurityHelper.ValidatePassword(dto.Password);
				if (!isValid)
					return Result<UserResponseDto>.Failure(error);

				user.PasswordHash = SecurityHelper.HashPassword(dto.Password);
			}

			// ✅ Cập nhật roles nếu có
			if (dto.Roles != null)
			{
				// Lấy danh sách role hợp lệ từ DB
				var validRoles = await _uow.Roles.GetRolesByNamesAsync(dto.Roles);

				if (!validRoles.Any())
					return Result<UserResponseDto>.Failure("No valid roles found.");

				// Xóa các role cũ không còn trong danh sách mới
				var rolesToRemove = user.Roles
					.Where(r => !validRoles.Any(v => v.Id == r.Id))
					.ToList();

				foreach (var role in rolesToRemove)
					user.Roles.Remove(role);

				// Thêm các role mới chưa có
				foreach (var role in validRoles)
				{
					if (!user.Roles.Any(r => r.Id == role.Id))
						user.Roles.Add(role);
				}
			}

			await _uow.Users.UpdateAsync(user);
			await _uow.SaveChangesAsync();

			// Load lại roles sau khi cập nhật
			var updatedRoles = await _uow.Roles.GetRolesByUserIdAsync(user.Id);

			var response = new UserResponseDto
			{
				Id = user.Id,
				Email = user.Email,
				FullName = user.FullName,
				Status = user.Status,
				CreatedAt = user.CreatedAt,
				Roles = updatedRoles.Select(r => r.RoleName).ToList()
			};

			return Result<UserResponseDto>.Success(response);
		}



		// Generate password
		private static string GenerateTemporaryPassword(int length = NumberConstants.MinPasswordLength)
		{
			const string lowers = "abcdefghjkmnpqrstuvwxyz";
			const string uppers = "ABCDEFGHJKMNPQRSTUVWXYZ";
			const string digits = "23456789";
			const string specials = "!@#$%^&*";
			var all = lowers + uppers + digits + specials;
			var random = new Random();
			var chars = new char[length];
			for (int i = 0; i < length; i++)
			{
				chars[i] = all[random.Next(all.Length)];
			}
			return new string(chars);
		}
	}
}
