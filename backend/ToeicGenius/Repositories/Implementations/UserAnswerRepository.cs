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

        public async Task<UserAnswer?> GetByTestResultAndQuestionAsync(int testResultId, int testQuestionId, int? subQuestionIndex)
        {
            var query = _context.UserAnswers
                .Where(ua => ua.TestResultId == testResultId && ua.TestQuestionId == testQuestionId);

            if (subQuestionIndex.HasValue)
            {
                // For question groups: match by specific subQuestionIndex
                query = query.Where(ua => ua.SubQuestionIndex == subQuestionIndex.Value);
            }
            else
            {
                // For single questions: SubQuestionIndex should be null OR not set
                // Some records might have SubQuestionIndex = null, others might not have it at all
                query = query.Where(ua => ua.SubQuestionIndex == null || ua.SubQuestionIndex == 0);
            }

            return await query.FirstOrDefaultAsync();
        }

        public async Task<List<UserAnswer>> GetByTestResultIdAsync(int testResultId)
        {
            return await _context.UserAnswers
                .Where(ua => ua.TestResultId == testResultId)
                .ToListAsync();
        }
    }
}


