namespace ToeicGenius.Domains.DTOs.Responses.Auth
{
	public class LoginResponseDto
	{
		public string? Token { get; set; }
		public string? RefreshToken { get; set; }
		public Guid? UserId { get; set; }
		public string? Fullname { get; set; }
	}
}
