using Google.Apis.Auth;
using ToeicGenius.Domains.DTOs.Responses.Auth;

namespace ToeicGenius.Services.Interfaces
{
	public interface IGoogleAuthService
	{
		Task<GoogleTokenResponse> ExchangeCodeForTokensAsync(string code);
		Task<GoogleJsonWebSignature.Payload> ValidateIdTokenAsync(string idToken);
	}
}
