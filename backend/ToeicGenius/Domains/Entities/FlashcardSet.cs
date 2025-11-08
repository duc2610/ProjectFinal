using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class FlashcardSet
	{
		[Key]
		public int SetId { get; set; }

		[Required]
		[MaxLength(255)]
		public string Title { get; set; } = string.Empty;

		public string? Description { get; set; }

		[MaxLength(50)]
		public string Language { get; set; } = "en-US"; // Tiếng Anh-Mỹ, en-GB, ja, zh, ko, vi

		public bool IsPublic { get; set; } = false;

		[Required]
		public Guid UserId { get; set; }
		public User User { get; set; } = null!;

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }

		public int TotalCards { get; set; } = 0; // Cached count for performance

		public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
	}
}


