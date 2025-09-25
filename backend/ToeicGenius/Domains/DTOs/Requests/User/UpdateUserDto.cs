using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.User
{
	public class UpdateUserDto
	{
		[Required, MaxLength(100)]
		public string FullName { get; set; } = string.Empty;

		[MaxLength(200)]
		public string? Password { get; set; }

		public List<string>? Roles { get; set; }
	}
}


