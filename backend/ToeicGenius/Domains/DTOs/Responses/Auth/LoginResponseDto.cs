namespace ToeicGenius.Domains.DTOs.Responses.Auth
{
	public class LoginResponseDto
	{
		public string? Token { get; set; }
		public Guid? UserId { get; set; }
		public string? Fullname { get; set; }
	}
}
