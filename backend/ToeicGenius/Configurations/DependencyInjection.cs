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

			// Services
			services.AddScoped<IJwtService, JwtService>();
			services.AddScoped<IAuthService, AuthService>();
			services.AddScoped<IEmailService, EmailService>();
			services.AddScoped<IGoogleAuthService, GoogleAuthService>();


		}
	}
}
