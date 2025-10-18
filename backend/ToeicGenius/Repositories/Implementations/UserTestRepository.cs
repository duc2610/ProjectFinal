using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class UserTestRepository : BaseRepository<TestResult, int>, IUserTestRepository
	{
		public UserTestRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


