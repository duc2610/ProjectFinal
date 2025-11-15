using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
    public class FlashcardSetRepository : BaseRepository<FlashcardSet, int>, IFlashcardSetRepository
    {
        public FlashcardSetRepository(ToeicGeniusDbContext context) : base(context) { }

        public async Task<IEnumerable<FlashcardSet>> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Where(fs => fs.UserId == userId)
                .OrderByDescending(fs => fs.CreatedAt)
                .ToListAsync();
        }

        public async Task<FlashcardSet?> GetByIdWithCardsAsync(int setId)
        {
            return await _dbSet
                .Include(fs => fs.Flashcards)
                .FirstOrDefaultAsync(fs => fs.SetId == setId);
        }

        public async Task<bool> IsOwnerAsync(int setId, Guid userId)
        {
            return await _dbSet
                .AnyAsync(fs => fs.SetId == setId && fs.UserId == userId);
        }

        public async Task UpdateTotalCardsAsync(int setId)
        {
            var set = await _dbSet.FindAsync(setId);
            if (set != null)
            {
                set.TotalCards = await _context.Flashcards
                    .CountAsync(f => f.SetId == setId);
                set.UpdatedAt = DateTime.UtcNow;
            }
        }

        public async Task<IEnumerable<FlashcardSet>> GetPublicSetsAsync()
        {
            return await _dbSet
                .Where(fs => fs.IsPublic == true)
                .Include(fs => fs.User)
                .OrderByDescending(fs => fs.CreatedAt)
                .ToListAsync();
        }

        public async Task<FlashcardSet?> GetByIdWithCardsAndProgressAsync(int setId, Guid userId)
        {
            return await _dbSet
                .Include(fs => fs.Flashcards)
                    .ThenInclude(f => f.Progresses.Where(p => p.UserId == userId))
                .FirstOrDefaultAsync(fs => fs.SetId == setId);
        }
    }
}


