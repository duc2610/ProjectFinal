using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class FlashcardProgressRepository : BaseRepository<FlashcardProgress, int>, IFlashcardProgressRepository
	{
		public FlashcardProgressRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


