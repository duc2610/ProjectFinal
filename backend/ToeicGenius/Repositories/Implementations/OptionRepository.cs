using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class OptionRepository : BaseRepository<Option, int>, IOptionRepository
	{
		public OptionRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<List<Option>> GetOptionsByQuestionIdAsync(int questionId)
		{
			return await _context.Options
				.Where(o => o.QuestionId == questionId)
				.ToListAsync();
		}

		public void RemoveRange(IEnumerable<Option> options)
		{
			_context.Options.RemoveRange(options);
		}
	}
}


