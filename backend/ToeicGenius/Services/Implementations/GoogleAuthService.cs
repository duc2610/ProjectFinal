using Google.Apis.Auth;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class GoogleAuthService : IGoogleAuthService
	{
		public Task<(string idToken, string accessToken)> ExchangeCodeForTokensAsync(string code)
		{
			throw new NotImplementedException();
		}

		public Task<GoogleJsonWebSignature.Payload> ValidateIdTokenAsync(string idToken)
		{
			throw new NotImplementedException();
		}
	}
}
