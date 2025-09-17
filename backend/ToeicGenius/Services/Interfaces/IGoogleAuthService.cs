using Google.Apis.Auth;

namespace ToeicGenius.Services.Interfaces
{
	public interface IGoogleAuthService
	{
		Task<(string idToken, string accessToken)> ExchangeCodeForTokensAsync(string code);
		Task<GoogleJsonWebSignature.Payload> ValidateIdTokenAsync(string idToken);
	}
}
