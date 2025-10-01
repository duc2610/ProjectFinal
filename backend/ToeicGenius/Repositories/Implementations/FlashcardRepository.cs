using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class FlashcardRepository : BaseRepository<Flashcard, int>, IFlashcardRepository
	{
		public FlashcardRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


