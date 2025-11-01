using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.DTOs.Requests.User;
using ToeicGenius.Domains.DTOs.Responses.User;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IUserRepository : IBaseRepository<User, Guid>
	{
		Task<User?> GetByEmailAsync(string email);
		Task<User?> GetByRefreshTokenAsync(string refreshToken);
		Task<User?> GetUserAndRoleByUserIdAsync(Guid userId);
		Task<int> CountTotalUsersAsync();
		Task<int> CountActiveUsersAsync();
		Task<int> CountBannedUsersAsync();
		Task<int> CountNewUsersThisWeekAsync();
		Task<int> CountNewUsersThisMonthAsync();

		Task<PaginationResponse<UserResponseDto>> GetUsersAsync(UserResquestDto request);
	}
}
