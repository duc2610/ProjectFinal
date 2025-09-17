using System.Security.Claims;
using ToeicGenius.Domains.Entities;

namespace ToeicGenius.Services.Interfaces
{
	public interface IJwtService
	{
		string GenerateToken(User user);
		ClaimsPrincipal? ValidateToken(string token);
	}
}
