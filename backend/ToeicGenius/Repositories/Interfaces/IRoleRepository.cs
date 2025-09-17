using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IRoleRepository
	{
		Task<List<Role>> GetRolesByUserIdAsync(Guid userId);
	}
}
