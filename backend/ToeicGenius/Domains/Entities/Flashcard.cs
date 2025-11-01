using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class Flashcard
	{
		[Key]
		public int CardId { get; set; }

		[Required]
		public int SetId { get; set; }
		public FlashcardSet FlashcardSet { get; set; } = null!;

		public string? FrontText { get; set; }
		public string? BackText { get; set; }
		public string? AudioUrl { get; set; }
		public string? MediaUrl { get; set; }

		public ICollection<FlashcardProgress> Progresses { get; set; } = new List<FlashcardProgress>();
	}
}



