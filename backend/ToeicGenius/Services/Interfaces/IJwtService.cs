using System.Security.Claims;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Services.Interfaces
{
	public interface IJwtService
	{
		RefreshToken GenerateRefreshToken(string ipAddress);
		string GenerateAccessToken(User user);
		ClaimsPrincipal? ValidateToken(string token);
	}
}
