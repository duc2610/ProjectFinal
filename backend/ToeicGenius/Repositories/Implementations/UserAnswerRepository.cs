using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
    public class UserAnswerRepository : BaseRepository<UserAnswer, int>, IUserAnswerRepository
    {
        public UserAnswerRepository(ToeicGeniusDbContext context) : base(context) { }
        public async Task<UserAnswer?> GetByTestResultAndTestQuestionAsync(int testResultId, int testQuestionId)
        {
            return await _context.UserAnswers
                .Include(ua => ua.TestQuestion)
                .Include(ua => ua.TestResult)
                .Where(ua => ua.TestResultId == testResultId && ua.TestQuestionId == testQuestionId)
                .FirstOrDefaultAsync();
        }
    }
}


