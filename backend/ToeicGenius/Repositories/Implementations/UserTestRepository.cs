using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class UserTestRepository : BaseRepository<UserTest, int>, IUserTestRepository
	{
		public UserTestRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


