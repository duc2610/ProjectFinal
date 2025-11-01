using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class UserOtpRepository : BaseRepository<UserOtp, Guid>, IUserOtpRepository
	{
		public UserOtpRepository(ToeicGeniusDbContext context) : base(context) { }

		// Get OTP by Email with type
		public async Task<UserOtp?> GetOtpByEmailAsync(string email, int type)
		{
			return await _context.UserOtps
				.Where(o => o.Email == email && o.Type == type)
				.OrderByDescending(o => o.CreatedAt)
				.FirstOrDefaultAsync();
		}
	}
}
