using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Flashcard
{
	/// <summary>
	/// DTO for adding flashcard from test (when user highlights text during practice/simulator)
	/// </summary>
	public class AddFlashcardFromTestDto
	{
		/// <summary>
		/// SetId nếu chọn list có sẵn, hoặc null nếu tạo list mới
		/// </summary>
		public int? SetId { get; set; }

		/// <summary>
		/// Thông tin list mới (chỉ dùng khi SetId = null)
		/// </summary>
		public CreateFlashcardSetDto? NewSet { get; set; }

		[Required]
		[MaxLength(500)]
		public string Term { get; set; } = string.Empty; // Text đã bôi đen

		public string? Definition { get; set; }

		[MaxLength(255)]
		public string? Pronunciation { get; set; }

		public string? ImageUrl { get; set; } // Có thể lấy từ câu hỏi đang làm

		[MaxLength(50)]
		public string? WordType { get; set; }

		public List<string>? Examples { get; set; }

		public string? Notes { get; set; }
	}
}
