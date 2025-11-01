using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class OptionRepository : BaseRepository<Option, int>, IOptionRepository
	{
		public OptionRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


