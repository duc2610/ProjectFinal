using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Flashcard
{
	public class UpdateFlashcardDto
	{
		[Required]
		[MaxLength(500)]
		public string Term { get; set; } = string.Empty;

		public string? Definition { get; set; }

		[MaxLength(255)]
		public string? Pronunciation { get; set; }

		public string? ImageUrl { get; set; }

		[MaxLength(50)]
		public string? WordType { get; set; }

		public List<string>? Examples { get; set; }

		public string? Notes { get; set; }

		public string? AudioUrl { get; set; }
	}
}
