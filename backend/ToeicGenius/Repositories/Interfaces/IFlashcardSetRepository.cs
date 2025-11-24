using ToeicGenius.Domains.DTOs.Common;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
    public interface IFlashcardSetRepository : IBaseRepository<FlashcardSet, int>
    {
        Task<IEnumerable<FlashcardSet>> GetByUserIdAsync(Guid userId);
        Task<PaginationResponse<FlashcardSet>> GetByUserIdPaginatedAsync(Guid userId, string? keyword, string sortOrder, int page, int pageSize);
        Task<FlashcardSet?> GetByIdWithCardsAsync(int setId);
        Task<bool> IsOwnerAsync(int setId, Guid userId);
        Task UpdateTotalCardsAsync(int setId);
        Task<IEnumerable<FlashcardSet>> GetPublicSetsAsync();
        Task<FlashcardSet?> GetByIdWithCardsAndProgressAsync(int setId, Guid userId);
    }
}


