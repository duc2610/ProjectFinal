using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
    public interface IFlashcardSetRepository : IBaseRepository<FlashcardSet, int>
    {
        Task<IEnumerable<FlashcardSet>> GetByUserIdAsync(Guid userId);
        Task<FlashcardSet?> GetByIdWithCardsAsync(int setId);
        Task<bool> IsOwnerAsync(int setId, Guid userId);
        Task UpdateTotalCardsAsync(int setId);
    }
}


