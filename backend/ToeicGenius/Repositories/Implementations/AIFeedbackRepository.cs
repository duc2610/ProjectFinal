using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class AIFeedbackRepository : BaseRepository<AIFeedback, int>, IAIFeedbackRepository
	{
		public AIFeedbackRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


