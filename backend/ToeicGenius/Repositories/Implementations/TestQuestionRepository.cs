using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class TestQuestionRepository : BaseRepository<TestQuestion, int>, ITestQuestionRepository
	{
		public TestQuestionRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<List<TestQuestion>> GetByTestIdAsync(int testId)
		{
			return await _context.TestQuestions
			.Where(tq => tq.TestId == testId)
			.ToListAsync();
		}

		public void RemoveRange(IEnumerable<TestQuestion> entities)
		{
			_context.TestQuestions.RemoveRange(entities);
		}
	}
}
