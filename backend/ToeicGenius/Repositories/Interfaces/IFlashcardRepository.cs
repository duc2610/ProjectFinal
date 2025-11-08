using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface IFlashcardRepository : IBaseRepository<Flashcard, int>
	{
		Task<IEnumerable<Flashcard>> GetBySetIdAsync(int setId);
		Task<int> CountBySetIdAsync(int setId);
		Task DeleteBySetIdAsync(int setId);
	}
}


