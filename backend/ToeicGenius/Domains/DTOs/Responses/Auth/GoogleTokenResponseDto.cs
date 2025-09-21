using System.Text.Json.Serialization;

namespace ToeicGenius.Domains.DTOs.Responses.Auth
{
	public class GoogleTokenResponse
	{
		[JsonPropertyName("access_token")]
		public string AccessToken { get; set; } = string.Empty;

		[JsonPropertyName("expires_in")]
		public int ExpiresIn { get; set; }

		[JsonPropertyName("id_token")]
		public string IdToken { get; set; } = string.Empty;

		[JsonPropertyName("scope")]
		public string Scope { get; set; } = string.Empty;

		[JsonPropertyName("token_type")]
		public string TokenType { get; set; } = string.Empty;
	}
}
