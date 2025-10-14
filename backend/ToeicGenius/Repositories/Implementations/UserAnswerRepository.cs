using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class UserAnswerRepository : BaseRepository<UserAnswer, int>, IUserAnswerRepository
	{
		public UserAnswerRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


