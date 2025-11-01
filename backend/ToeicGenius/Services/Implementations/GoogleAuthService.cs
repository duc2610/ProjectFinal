using Google.Apis.Auth;
using System.Text.Json;
using ToeicGenius.Domains.DTOs.Responses.Auth;
using ToeicGenius.Services.Interfaces;

namespace ToeicGenius.Services.Implementations
{
	public class GoogleAuthService : IGoogleAuthService
	{
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly IConfiguration _config;

		public GoogleAuthService(IHttpClientFactory httpClientFactory, IConfiguration config)
		{
			_httpClientFactory = httpClientFactory;
			_config = config;
		}
		public async Task<GoogleTokenResponse> ExchangeCodeForTokensAsync(string code)
		{
			var client = _httpClientFactory.CreateClient();

			var request = new Dictionary<string, string>
							{
								{"code", code},
								{"client_id", _config["Authentication:Google:ClientId"]!},
								{"client_secret", _config["Authentication:Google:ClientSecret"]!},
								{"redirect_uri", _config["Authentication:Google:RedirectUri"]!},
								{"grant_type", "authorization_code"}
							};

			var response = await client.PostAsync(
				"https://oauth2.googleapis.com/token",
				new FormUrlEncodedContent(request)
			);

			var json = await response.Content.ReadAsStringAsync();
			if (!response.IsSuccessStatusCode)
			{
				throw new Exception($"Google token exchange failed: {json}");
			}

			var tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(json);
			if (tokenResponse == null)
				throw new Exception("Failed to deserialize Google token response");

			return tokenResponse;
		}

		public async Task<GoogleJsonWebSignature.Payload> ValidateIdTokenAsync(string idToken)
		{
			var settings = new GoogleJsonWebSignature.ValidationSettings()
			{
				Audience = new[] { _config["Authentication:Google:ClientId"]! }
			};

			return await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
		}
	}
}
