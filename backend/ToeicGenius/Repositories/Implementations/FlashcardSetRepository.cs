using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;
using ToeicGenius.Shared.Constants;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

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

        public async Task<PaginationResponse<FlashcardSet>> GetByUserIdPaginatedAsync(Guid userId, string? keyword, string sortOrder, int page, int pageSize)
        {
            var query = _dbSet.Where(fs => fs.UserId == userId);

            // Apply keyword filter
            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(fs => fs.Title.ToLower().Contains(keyword) ||
                                         (fs.Description != null && fs.Description.ToLower().Contains(keyword)));
            }

            // Apply sorting
            query = sortOrder.ToLower() == "asc"
                ? query.OrderBy(fs => fs.CreatedAt)
                : query.OrderByDescending(fs => fs.CreatedAt);

            // Ensure valid pagination parameters
            page = page <= 0 ? NumberConstants.DefaultFirstPage : page;
            pageSize = pageSize <= 0 ? NumberConstants.DefaultPageSize : pageSize;

            var totalRecords = await query.CountAsync();
            var data = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PaginationResponse<FlashcardSet>(data, totalRecords, page, pageSize);
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
                set.UpdatedAt = Now;
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


