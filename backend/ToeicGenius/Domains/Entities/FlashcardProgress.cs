using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class FlashcardProgress
	{
		[Key]
		public int ProgressId { get; set; }

		[Required]
		public int FlashcardId { get; set; }
		public Flashcard Flashcard { get; set; } = null!;

		public string? Status { get; set; }
	}
}



