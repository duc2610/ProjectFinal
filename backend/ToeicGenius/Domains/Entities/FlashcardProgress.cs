using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class FlashcardProgress
	{
		[Key]
		public int ProgressId { get; set; }

		[Required]
		public int CardId { get; set; }
		public Flashcard Flashcard { get; set; } = null!;

		[Required]
		public Guid UserId { get; set; }
		public User User { get; set; } = null!;

		public int ReviewCount { get; set; } = 0; // Số lần đã review
		public int CorrectCount { get; set; } = 0; // Số lần trả lời đúng
		public int IncorrectCount { get; set; } = 0; // Số lần trả lời sai

		[MaxLength(50)]
		public string Status { get; set; } = "new"; // new, learning, reviewing, mastered

		public DateTime? LastReviewedAt { get; set; }
		public DateTime? NextReviewAt { get; set; }

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }
	}
}



