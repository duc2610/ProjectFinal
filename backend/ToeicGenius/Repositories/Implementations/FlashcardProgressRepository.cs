using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
    public class FlashcardProgressRepository : BaseRepository<FlashcardProgress, int>, IFlashcardProgressRepository
    {
        public FlashcardProgressRepository(ToeicGeniusDbContext context) : base(context) { }

        public async Task<FlashcardProgress?> GetByCardAndUserAsync(int cardId, Guid userId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(fp => fp.CardId == cardId && fp.UserId == userId);
        }

        public async Task<IEnumerable<FlashcardProgress>> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(fp => fp.UserId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<FlashcardProgress>> GetBySetAndUserAsync(int setId, Guid userId)
        {
            return await _dbSet
                .Include(fp => fp.Flashcard)
                .Where(fp => fp.Flashcard.SetId == setId && fp.UserId == userId)
                .ToListAsync();
        }
    }
}


