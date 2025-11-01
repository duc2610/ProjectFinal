using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class RoleRepository : BaseRepository<Role, int>, IRoleRepository
	{
		public RoleRepository(ToeicGeniusDbContext context) : base(context) { }

		// Get roles by userId
		// Get roles by userId
		public async Task<List<Role>> GetRolesByUserIdAsync(Guid userId)
		{
			var roles = await _context.Users
									  .Where(u => u.Id == userId)
									  .Include(u => u.Roles)
									  .SelectMany(u => u.Roles)
									  .ToListAsync();

			return roles;
		}

		public async Task<List<Role>> GetRolesByNamesAsync(IEnumerable<string> roleNames)
		{
			var normalized = roleNames.Select(r => r.Trim()).Where(r => !string.IsNullOrWhiteSpace(r)).ToList();
			if (normalized.Count == 0) return new List<Role>();
			return await _context.Roles.Where(r => normalized.Contains(r.RoleName)).ToListAsync();
		}
	}
}
