using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Flashcard
{
	public class UpdateFlashcardSetDto
	{
		[Required]
		[MaxLength(255)]
		public string Title { get; set; } = string.Empty;

		public string? Description { get; set; }

		[MaxLength(50)]
		public string Language { get; set; } = "en-US";

		public bool IsPublic { get; set; } = false;
	}
}
