namespace ToeicGenius.Domains.DTOs.Responses.Auth
{
	public class RefreshTokenResponseDto
	{
		public string Token { get; set; } = string.Empty;
		public string RefreshToken { get; set; } = string.Empty;
	}
}
