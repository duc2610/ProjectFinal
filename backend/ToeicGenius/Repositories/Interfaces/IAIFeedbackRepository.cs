using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Repositories.Interfaces
{
    public interface IAIFeedbackRepository : IBaseRepository<AIFeedback, int>
    {
        Task<AIFeedback> CreateAsync(AIFeedback feedback);
        Task<AIFeedback> GetByIdAsync(int feedbackId);
        Task<AIFeedback> GetByUserAnswerIdAsync(int userAnswerId);
        Task<List<AIFeedback>> GetByUserIdAsync(Guid userId, int skip = 0, int take = 20);
        Task<List<AIFeedback>> GetHistoryAsync(Guid userId, string aiScorer = null);
        Task<List<AIFeedback>> GetByTestResultAndSkillAsync(int testResultId, string skill);
        Task<AIFeedback> UpdateAsync(AIFeedback feedback);
        Task<bool> DeleteAsync(int feedbackId);
        Task<bool> IsUserOwnerAsync(int feedbackId, Guid userId);
    }
}


