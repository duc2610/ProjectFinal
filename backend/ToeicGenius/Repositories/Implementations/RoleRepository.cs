using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class RoleRepository : BaseRepository<Role, Guid>, IRoleRepository
	{
		public RoleRepository(ToeicGeniusDbContext context) : base(context) { }

		// Get roles by userId
		public async Task<List<Role>> GetRolesByUserIdAsync(Guid userId)
		{
			var user = await _context.Users
									 .Include(u => u.Roles)
									 .FirstOrDefaultAsync(u => u.Id == userId);

			if (user == null)
				return new List<Role>();

			return user.Roles.ToList();
		}
	}
}
