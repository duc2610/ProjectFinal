using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Shared.Helpers;
using System.Text;

namespace ToeicGenius.Services.Implementations
{
	public class UserService : IUserService
	{
		private readonly IUserRepository _userRepository;
		private readonly IRoleRepository _roleRepository;
		private readonly IEmailService _emailService;
		public UserService(IUserRepository userRepository, IRoleRepository roleRepository, IEmailService emailService)
		{
			_userRepository = userRepository;
			_roleRepository = roleRepository;
			_emailService = emailService;
		}

		public async Task<Result<string>> UpdateStatus(Guid userId, UserStatus userStatus)
		{
			var user = await _userRepository.GetByIdAsync(userId);
			if (user == null)
			{
				return Result<string>.Failure(ErrorMessages.UserNotFound);
			}
			user.Status = userStatus;
			await _userRepository.UpdateAsync(user);
			return Result<string>.Success(SuccessMessages.UserStatusUpdated);
		}

		public async Task<Result<UserResponseDto?>> GetUserByIdAsync(Guid userId)
		{
			var user = await _userRepository.GetByIdAsync(userId);
			if (user == null)
			{
				return Result<UserResponseDto>.Failure(ErrorMessages.UserNotFound);
			}
			var roles = await _roleRepository.GetRolesByUserIdAsync(userId);
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
			var result = await _userRepository.GetUsersAsync(request);
			return Result<PaginationResponse<UserResponseDto>>.Success(result);
		}

		// Get statistic (about user)
		public async Task<Result<UserStatisticsResponseDto>> GetUserStatisticsAsync()
		{

			var result = new UserStatisticsResponseDto
			{
				TotalUsers = await _userRepository.CountTotalUsersAsync(),
				ActiveUsers = await _userRepository.CountActiveUsersAsync(),
				BannedUsers = await _userRepository.CountBannedUsersAsync(),
				NewUsersThisWeek = await _userRepository.CountNewUsersThisWeekAsync(),
				NewUsersThisMonth = await _userRepository.CountNewUsersThisMonthAsync()
			};
			return Result<UserStatisticsResponseDto>.Success(result);
		}

		public async Task<Result<UserResponseDto>> CreateUserAsync(CreateUserDto dto)
		{
			var existing = await _userRepository.GetByEmailAsync(dto.Email);
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

			await _userRepository.AddAsync(user);

			// Assign roles if provided
			if (dto.Roles != null && dto.Roles.Count > 0)
			{
				var rolesToAssign = await _roleRepository.GetRolesByNamesAsync(dto.Roles);
				user.Roles = rolesToAssign;
				await _userRepository.UpdateAsync(user);
			}

			var (subject, body) = EmailTemplates.BuildAccountCreatedEmail(user.FullName, user.Email, plainPassword);

			await _emailService.SendMail(user.Email, subject, body);

			var roles = await _roleRepository.GetRolesByUserIdAsync(user.Id);
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
			var user = await _userRepository.GetByIdAsync(userId);
			if (user == null)
			{
				return Result<UserResponseDto>.Failure(ErrorMessages.UserNotFound);
			}

			user.FullName = dto.FullName;
			if (!string.IsNullOrWhiteSpace(dto.Password))
			{
				user.PasswordHash = SecurityHelper.HashPassword(dto.Password);
			}
			user.UpdatedAt = DateTime.UtcNow;

			await _userRepository.UpdateAsync(user);

			// Update roles if provided
			if (dto.Roles != null)
			{
				var rolesToAssign = await _roleRepository.GetRolesByNamesAsync(dto.Roles);
				user.Roles = rolesToAssign;
				await _userRepository.UpdateAsync(user);
			}

			var roles = await _roleRepository.GetRolesByUserIdAsync(user.Id);
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
