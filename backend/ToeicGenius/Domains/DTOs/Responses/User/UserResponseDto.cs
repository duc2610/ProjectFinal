using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.User
{
	public class UserResponseDto
	{
		public Guid Id { get; set; }

		public string Email { get; set; } = string.Empty;

		public string FullName { get; set; } = string.Empty;

		public UserStatus Status { get; set; } = UserStatus.Active;
		public List<string> Roles { get; set; } = new();

		public DateTime CreatedAt { get; set; }
	}
}
