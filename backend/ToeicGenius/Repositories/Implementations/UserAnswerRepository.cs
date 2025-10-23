using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
    public class UserAnswerRepository : BaseRepository<UserAnswer, int>, IUserAnswerRepository
    {
        public UserAnswerRepository(ToeicGeniusDbContext context) : base(context) { }
        public async Task<UserAnswer?> GetByUserTestAndQuestionAsync(int userTestId, int questionId)
        {
            return await _context.UserAnswers
                .Include(ua => ua.Question)
                .Include(ua => ua.UserTest)
                .Where(ua => ua.UserTestId == userTestId && ua.QuestionId == questionId)
                .FirstOrDefaultAsync();
        }
    }
}


