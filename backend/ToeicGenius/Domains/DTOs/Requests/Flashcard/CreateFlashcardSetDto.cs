using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Flashcard
{
	public class CreateFlashcardSetDto
	{
		[Required]
		[MaxLength(255)]
		public string Title { get; set; } = string.Empty;

		public string? Description { get; set; }

		[Required]
		[MaxLength(50)]
		public string Language { get; set; } = "en-US"; // en-US, en-GB, ja, zh, ko, vi

		public bool IsPublic { get; set; } = false;
	}
}
