using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class FlashcardSetRepository : BaseRepository<FlashcardSet, int>, IFlashcardSetRepository
	{
		public FlashcardSetRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


