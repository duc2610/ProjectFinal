using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class AIFeedback
	{
		[Key]
		public int FeedbackId { get; set; }

		[Required]
		public int UserAnswerId { get; set; }
		public UserAnswer UserAnswer { get; set; } = null!;

		public decimal Score { get; set; }
		public string? Content { get; set; }
		public string? AIScorer { get; set; }
	}
}


