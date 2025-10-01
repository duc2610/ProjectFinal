using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class PartRepository : BaseRepository<Part, int>, IPartRepository
	{
		public PartRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


