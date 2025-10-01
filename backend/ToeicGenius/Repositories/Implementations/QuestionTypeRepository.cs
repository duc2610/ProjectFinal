using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class QuestionTypeRepository : BaseRepository<QuestionType, int>, IQuestionTypeRepository
	{
		public QuestionTypeRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


