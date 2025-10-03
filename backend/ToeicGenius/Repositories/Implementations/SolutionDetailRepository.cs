using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class SolutionDetailRepository : BaseRepository<SolutionDetail, int>, ISolutionDetailRepository
	{
		public SolutionDetailRepository(ToeicGeniusDbContext context) : base(context) { }

	}
}

