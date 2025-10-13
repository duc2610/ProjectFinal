using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class FlashcardSet
	{
		[Key]
		public int SetId { get; set; }

		public string Title { get; set; } = string.Empty;
		public string? Description { get; set; }
		public bool IsPublic { get; set; }

		[Required]
		public Guid UserId { get; set; }
		public User User { get; set; } = null!;

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }
		public string? Status { get; set; }

		public ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
	}
}


