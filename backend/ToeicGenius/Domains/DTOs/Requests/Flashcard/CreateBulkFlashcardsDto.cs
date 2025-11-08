using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Flashcard
{
	public class CreateBulkFlashcardsDto
	{
		[Required]
		public int SetId { get; set; }

		[Required]
		[MinLength(1)]
		public List<BulkFlashcardItemDto> Flashcards { get; set; } = new();
	}

	public class BulkFlashcardItemDto
	{
		[Required]
		[MaxLength(500)]
		public string Term { get; set; } = string.Empty; // Từ mới

		public string? Definition { get; set; } // Định nghĩa

		public string? Example1 { get; set; } // Ví dụ 1

		public string? Example2 { get; set; } // Ví dụ 2

		[MaxLength(255)]
		public string? Pronunciation { get; set; } // Phiên âm

		public string? Notes { get; set; } // Ghi chú
	}
}
