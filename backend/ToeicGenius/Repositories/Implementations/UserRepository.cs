using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class UserRepository : BaseRepository<User, Guid>, IUserRepository
	{

		public UserRepository(ToeicGeniusDbContext context) : base(context) { }

		// Get user by Email
		public async Task<User?> GetByEmailAsync(string email)
		{
			return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
		}

		public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
		{
			return await _context.Users
								.Include(u => u.RefreshTokens) // load refresh tokens
								.FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.Token == refreshToken));
		}
	}
}
