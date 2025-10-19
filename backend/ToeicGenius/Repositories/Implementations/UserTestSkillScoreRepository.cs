using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class UserTestSkillScoreRepository : BaseRepository<UserTestSkillScore, int>, IUserTestSkillScoreRepository
	{
		public UserTestSkillScoreRepository(ToeicGeniusDbContext context) : base(context) { }
	}
}


