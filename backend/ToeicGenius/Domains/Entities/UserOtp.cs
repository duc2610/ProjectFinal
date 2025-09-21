using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class UserOtp
	{
		[Key]
		public Guid Id { get; set; }

		[Required, MaxLength(200)]
		public string Email { get; set; } = string.Empty;

		[Required, MaxLength(200)]
		public string OtpCodeHash { get; set; } = string.Empty;

		public int Type { get; set; }

		public DateTime ExpiresAt { get; set; }
		public DateTime? CreatedAt { get; set; }
		public DateTime? UsedAt { get; set; }
	}
}
