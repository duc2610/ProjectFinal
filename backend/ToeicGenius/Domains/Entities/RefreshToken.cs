using System.ComponentModel.DataAnnotations;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.Entities
{
	public class RefreshToken
	{
		[Key]
		public Guid Id { get; set; }

		[Required]
		public Guid UserId { get; set; }
		public User User { get; set; } = null!;

		[Required, MaxLength(200)]
		public string Token { get; set; } = string.Empty;

		public DateTime ExpiresAt { get; set; }
		public DateTime CreatedAt { get; set; } = Now;

		[MaxLength(50)]
		public string? CreatedByIp { get; set; }

		public DateTime? RevokeAt { get; set; }
		[MaxLength(50)]
		public string? RevokeByIp { get; set; }

		[MaxLength(200)]
		public string? ReplacedByToken { get; set; }
	}
}
