using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IRoleRepository : IBaseRepository<Role, int>
	{
		Task<List<Role>> GetRolesByUserIdAsync(Guid userId);
        Task<List<Role>> GetRolesByNamesAsync(IEnumerable<string> roleNames);
	}
}
