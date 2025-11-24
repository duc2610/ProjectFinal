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

		public async Task<List<TestQuestion>> GetByTestAndPartAsync(int testId, int partId)
		{
			return await _context.TestQuestions
				.Where(q => q.TestId == testId && q.PartId == partId)
				.ToListAsync();
		}

		public async Task<TestQuestion?> GetByIdWithDetailsAsync(int testQuestionId)
		{
			return await _context.TestQuestions
				.Include(tq => tq.Test)
				.Include(tq => tq.Part)
				.FirstOrDefaultAsync(tq => tq.TestQuestionId == testQuestionId);
		}

		public async Task UpdateTestQuestionAsync(TestQuestion testQuestion)
		{
			_context.TestQuestions.Update(testQuestion);
			await _context.SaveChangesAsync();
		}
	}
}
