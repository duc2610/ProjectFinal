using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
    public interface IFlashcardProgressRepository : IBaseRepository<FlashcardProgress, int>
    {
        Task<FlashcardProgress?> GetByCardAndUserAsync(int cardId, Guid userId);
        Task<IEnumerable<FlashcardProgress>> GetByUserIdAsync(Guid userId);
    }
}


