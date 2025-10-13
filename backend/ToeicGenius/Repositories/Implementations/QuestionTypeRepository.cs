using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Domains.Enums;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class QuestionTypeRepository : BaseRepository<QuestionType, int>, IQuestionTypeRepository
	{
		public QuestionTypeRepository(ToeicGeniusDbContext context) : base(context) { }

		public async Task<List<QuestionType>> GetQuestionTypeByTestSkill(int partId)
		{
			return await _context.QuestionTypes.Where(x => x.PartId == partId).ToListAsync();
		}
	}
}


