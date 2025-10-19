using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class TestRepository : BaseRepository<Test, int>, ITestRepository
	{
		public TestRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


