using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Flashcard
{
	public class CreateFlashcardDto
	{
		[Required]
		public int SetId { get; set; }

		[Required]
		[MaxLength(500)]
		public string Term { get; set; } = string.Empty; // Từ mới

		public string? Definition { get; set; } // Định nghĩa

		[MaxLength(255)]
		public string? Pronunciation { get; set; } // Phiên âm

		public string? ImageUrl { get; set; } // Ảnh minh họa

		[MaxLength(50)]
		public string? WordType { get; set; } // N, V, ADJ, ADV, etc.

		public List<string>? Examples { get; set; } // Ví dụ (tối đa 10 câu)

		public string? Notes { get; set; } // Ghi chú

		public string? AudioUrl { get; set; } // Audio pronunciation
	}
}
