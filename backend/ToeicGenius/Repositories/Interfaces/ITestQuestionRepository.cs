using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
	public interface ITestQuestionRepository : IBaseRepository<TestQuestion, int>
	{
		Task<List<TestQuestion>> GetByTestIdAsync(int testId);
		void RemoveRange(IEnumerable<TestQuestion> entities);
		Task<List<TestQuestion>> GetByTestAndPartAsync(int testId, int partId);
		Task<TestQuestion?> GetByIdWithDetailsAsync(int testQuestionId);
		Task<List<TestQuestion>> GetByIdsWithPartAsync(List<int> testQuestionIds);
		Task UpdateTestQuestionAsync(TestQuestion testQuestion);
	}
}
