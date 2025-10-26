using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;

namespace ToeicGenius.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        IAIFeedbackRepository AIFeedbacks { get; }
        IFlashcardProgressRepository FlashcardProgresses { get; }
        IFlashcardRepository Flashcards { get; }
        IFlashcardSetRepository FlashcardSets { get; }
        IOptionRepository Options { get; }
        IPartRepository Parts { get; }
        IQuestionGroupRepository QuestionGroups { get; }
        IQuestionRepository Questions { get; }
        IQuestionTypeRepository QuestionTypes { get; }
        IRefreshTokenRepository RefreshTokens { get; }
        IRoleRepository Roles { get; }
        ITestRepository Tests { get; }
        IUserAnswerRepository UserAnswers { get; }
        IUserOtpRepository UserOtps { get; }
        IUserRepository Users { get; }
        ITestResultRepository TestResults { get; }
        IUserTestRepository UserTests { get; }
        IUserTestSkillScoreRepository UserTestSkillScores { get; }
        ITestQuestionRepository TestQuestions{ get; }

        Task<int> SaveChangesAsync();
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
