using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Repositories.Persistence;

namespace ToeicGenius.Repositories.Implementations
{
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private readonly ToeicGeniusDbContext _context;
        private bool _disposed = false;

        public IAIFeedbackRepository AIFeedbacks { get; }
        public IFlashcardProgressRepository FlashcardProgresses { get; }
        public IFlashcardRepository Flashcards { get; }
        public IFlashcardSetRepository FlashcardSets { get; }
        public IOptionRepository Options { get; }
        public IPartRepository Parts { get; }
        public IQuestionGroupRepository QuestionGroups { get; }
        public IQuestionRepository Questions { get; }
        public IQuestionTypeRepository QuestionTypes { get; }
        public IRefreshTokenRepository RefreshTokens { get; }
        public IRoleRepository Roles { get; }
        public ITestRepository Tests { get; }
        public ITestResultRepository TestResults { get; }
        public IUserAnswerRepository UserAnswers { get; }
        public IUserOtpRepository UserOtps { get; }
        public IUserRepository Users { get; }
        public IUserTestRepository UserTests { get; }
        public IUserTestSkillScoreRepository UserTestSkillScores { get; }

        public ITestQuestionRepository TestQuestions { get; }

        public UnitOfWork(ToeicGeniusDbContext context)
        {
            _context = context;
            AIFeedbacks = new AIFeedbackRepository(context);
            FlashcardProgresses = new FlashcardProgressRepository(context);
            Flashcards = new FlashcardRepository(context);
            FlashcardSets = new FlashcardSetRepository(context);
            Options = new OptionRepository(context);
            Parts = new PartRepository(context);
            QuestionGroups = new QuestionGroupRepository(context);
            Questions = new QuestionRepository(context);
            QuestionTypes = new QuestionTypeRepository(context);
            RefreshTokens = new RefreshTokenRepository(context);
            Roles = new RoleRepository(context);
            Tests = new TestRepository(context);
            TestResults = new TestResultRepository(context);
            UserAnswers = new UserAnswerRepository(context);
            UserOtps = new UserOtpRepository(context);
            Users = new UserRepository(context);
            UserTests = new UserTestRepository(context);
            UserTestSkillScores = new UserTestSkillScoreRepository(context);
            TestQuestions = new TestQuestionRepository(context);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            var transaction = _context.Database.CurrentTransaction;
            if (transaction != null)
                await transaction.CommitAsync();
        }

        public async Task RollbackTransactionAsync()
        {
            var transaction = _context.Database.CurrentTransaction;
            if (transaction != null)
                await transaction.RollbackAsync();
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _context.Dispose();
                _disposed = true;
            }
        }
    }
}
