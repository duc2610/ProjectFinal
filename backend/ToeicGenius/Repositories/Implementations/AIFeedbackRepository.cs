using Microsoft.EntityFrameworkCore;
using ToeicGenius.Domains.Entities;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
	public class AIFeedbackRepository : BaseRepository<AIFeedback, int>, IAIFeedbackRepository
	{
		public AIFeedbackRepository(ToeicGeniusDbContext context) : base(context) { }

        public async Task<AIFeedback> CreateAsync(AIFeedback feedback)
        {
            await _context.AIFeedbacks.AddAsync(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<AIFeedback> GetByIdAsync(int feedbackId)
        {
            return await _context.AIFeedbacks
                .Include(f => f.UserAnswer)
                    .ThenInclude(ua => ua!.TestQuestion)
                        .ThenInclude(tq => tq!.Part)
                .Include(f => f.UserAnswer)
                    .ThenInclude(ua => ua!.TestResult)
                .FirstOrDefaultAsync(f => f.FeedbackId == feedbackId);
        }

        public async Task<AIFeedback> GetByUserAnswerIdAsync(int userAnswerId)
        {
            return await _context.AIFeedbacks
                .Include(f => f.UserAnswer)
                .FirstOrDefaultAsync(f => f.UserAnswerId == userAnswerId);
        }

        public async Task<List<AIFeedback>> GetByUserIdAsync(Guid userId, int skip = 0, int take = 20)
        {
            return await _context.AIFeedbacks
                .Include(f => f.UserAnswer)
                    .ThenInclude(ua => ua!.TestQuestion)
                        .ThenInclude(tq => tq!.Part)
                .Where(f => f.UserAnswer!.TestResult!.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<List<AIFeedback>> GetHistoryAsync(Guid userId, string aiScorer = null)
        {
            var query = _context.AIFeedbacks
                .Include(f => f.UserAnswer)
                    .ThenInclude(ua => ua.TestResult)
                .Include(f => f.UserAnswer)
                    .ThenInclude(ua => ua.TestQuestion)
                .Where(f => f.UserAnswer.TestResult.UserId == userId);

            if (!string.IsNullOrEmpty(aiScorer))
            {
                query = query.Where(f => f.AIScorer == aiScorer);
            }

            return await query
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }

        public async Task<AIFeedback> UpdateAsync(AIFeedback feedback)
        {
            feedback.UpdatedAt = DateTime.UtcNow;
            _context.AIFeedbacks.Update(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<bool> DeleteAsync(int feedbackId)
        {
            var feedback = await _context.AIFeedbacks.FindAsync(feedbackId);
            if (feedback == null) return false;

            _context.AIFeedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsUserOwnerAsync(int feedbackId, Guid userId)
        {
            return await _context.AIFeedbacks
                .Include(f => f.UserAnswer)
                    .ThenInclude(ua => ua.TestResult)
                .AnyAsync(f => f.FeedbackId == feedbackId &&
                              f.UserAnswer.TestResult.UserId == userId);
        }
    }
}


