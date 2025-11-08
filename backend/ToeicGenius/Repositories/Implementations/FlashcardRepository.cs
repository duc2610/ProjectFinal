using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class FlashcardRepository : BaseRepository<Flashcard, int>, IFlashcardRepository
	{
		public FlashcardRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<IEnumerable<Flashcard>> GetBySetIdAsync(int setId)
		{
			return await _dbSet
				.Where(f => f.SetId == setId)
				.OrderBy(f => f.CreatedAt)
				.ToListAsync();
		}

		public async Task<int> CountBySetIdAsync(int setId)
		{
			return await _dbSet.CountAsync(f => f.SetId == setId);
		}

		public async Task DeleteBySetIdAsync(int setId)
		{
			var flashcards = await _dbSet.Where(f => f.SetId == setId).ToListAsync();
			_dbSet.RemoveRange(flashcards);
		}
	}
}


