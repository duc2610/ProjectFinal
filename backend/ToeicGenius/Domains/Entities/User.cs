using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.Entities
{
	public class User
	{
		[Key]
		public Guid Id { get; set; }

		[Required, MaxLength(200)]
		public string Email { get; set; } = string.Empty;

		[MaxLength(200)]
		public string? PasswordHash { get; set; }

		[MaxLength(200)]
		public string? GoogleId { get; set; }

		[Required, MaxLength(100)]
		public string FullName { get; set; } = string.Empty;

		public UserStatus Status { get; set; } = UserStatus.Active;

		public DateTime CreatedAt { get; set; } = Now;
		public DateTime? UpdatedAt { get; set; }
		public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
		public ICollection<Role> Roles { get; set; } = new List<Role>();
		public ICollection<TestResult> UserTests { get; set; } = new List<TestResult>();
	}
}
