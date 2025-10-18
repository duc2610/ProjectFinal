using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class TestQuestionRepository : BaseRepository<TestQuestion, int>, ITestQuestionRepository
	{
        public TestQuestionRepository(ToeicGeniusDbContext context) : base(context) { }
        
    }
}
