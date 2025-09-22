using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Interfaces;
using ToeicGenius.Shared.Constants;

namespace ToeicGenius.Services.Implementations
{
	public class UserService : IUserService
	{
		private readonly IUserRepository _userRepository;
		private readonly IRoleRepository _roleRepository;
		public UserService(IUserRepository userRepository)
		{
			_userRepository = userRepository;
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
	}
}
