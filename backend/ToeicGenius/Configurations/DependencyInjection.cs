using ToeicGenius.Repositories.Implementations;
using ToeicGenius.Repositories.Interfaces;
using ToeicGenius.Services.Implementations;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Configurations
{
	public static class DependencyInjection
	{
		public static void AddDependencyInjectionConfiguration(this IServiceCollection services, IConfiguration configuration)
		{
			// Repositories
			services.AddScoped<IUserRepository, UserRepository>();
			services.AddScoped<IUserOtpRepository, UserOtpRepository>();
			services.AddScoped<IRoleRepository, RoleRepository>();
			services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
			services.AddScoped<ITestRepository, TestRepository>();
			services.AddScoped<IUserAnswerRepository, UserAnswerRepository>();
			services.AddScoped<IUserTestRepository, UserTestRepository>();
			services.AddScoped<IUserTestSkillScoreRepository, UserTestSkillScoreRepository>();
			services.AddScoped<IFlashcardRepository, FlashcardRepository>();
			services.AddScoped<IFlashcardSetRepository, FlashcardSetRepository>();
			services.AddScoped<IFlashcardProgressRepository, FlashcardProgressRepository>();
			services.AddScoped<IOptionRepository, OptionRepository>();
			services.AddScoped<IPartRepository, PartRepository>();
			services.AddScoped<IQuestionGroupRepository, QuestionGroupRepository>();
			services.AddScoped<IQuestionRepository, QuestionRepository>();
			services.AddScoped<IQuestionTypeRepository, QuestionTypeRepository>();
			services.AddScoped<IAIFeedbackRepository, AIFeedbackRepository>();
			services.AddScoped<IUnitOfWork, UnitOfWork>();
			services.AddScoped<ITestQuestionRepository, TestQuestionRepository>();

			// Services
			services.AddScoped<IJwtService, JwtService>();
			services.AddScoped<IAuthService, AuthService>();
			services.AddScoped<IEmailService, EmailService>();
			services.AddScoped<IGoogleAuthService, GoogleAuthService>();
			services.AddScoped<IUserService, UserService>();
			services.AddScoped<IQuestionService, QuestionService>();
			services.AddScoped<IQuestionGroupService, QuestionGroupService>();
			services.AddScoped<IFileService, FileService>();
			services.AddScoped<ITestService, TestService>();
            services.AddScoped<IAssessmentService, AssessmentService>();
        }
	}
}
