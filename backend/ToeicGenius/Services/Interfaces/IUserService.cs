using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Services.Interfaces
{
	public interface IUserService
	{

		Task<Result<UserResponseDto?>> GetUserByIdAsync(Guid userId);
		Task<Result<PaginationResponse<UserResponseDto>>> GetUsersAsync(UserResquestDto userResquestDto);

		// Quản lý tài khoản
		Task<Result<string>> UpdateStatus(Guid userId, UserStatus userStatus);

		// Thống kê
		Task<Result<UserStatisticsResponseDto>> GetUserStatisticsAsync();
	}
}
