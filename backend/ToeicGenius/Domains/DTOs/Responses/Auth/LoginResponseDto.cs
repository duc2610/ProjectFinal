namespace ToeicGenius.Domains.DTOs.Responses.Auth
{
	public class LoginResponseDto
	{
		public string? Token { get; set; }
		public string? RefreshToken { get; set; }
		public Guid? UserId { get; set; }
		public string? Fullname { get; set; }
		public string? Email { get; set; }
		public DateTime? ExpireAt { get; set; }
	}
}
