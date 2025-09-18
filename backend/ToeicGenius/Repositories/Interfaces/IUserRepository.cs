using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IUserRepository : IBaseRepository<User, Guid>
	{
		Task<User?> GetByEmailAsync(string email);
		Task<User?> GetByRefreshTokenAsync(string refreshToken);
	}
}
