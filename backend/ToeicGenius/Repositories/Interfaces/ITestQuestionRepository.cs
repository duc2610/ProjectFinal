using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface ITestQuestionRepository : IBaseRepository<TestQuestion, int>
	{
		Task<List<TestQuestion>> GetByTestIdAsync(int testId);
		void RemoveRange(IEnumerable<TestQuestion> entities);
		Task<List<TestQuestion>> GetByListIdAsync(List<int> testQuestionId);

	}
}
