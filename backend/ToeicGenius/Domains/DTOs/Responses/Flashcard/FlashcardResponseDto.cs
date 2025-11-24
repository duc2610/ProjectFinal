namespace ToeicGenius.Domains.DTOs.Responses.Flashcard
{
	public class FlashcardResponseDto
	{
		public int CardId { get; set; }
		public int SetId { get; set; }
		public string Term { get; set; } = string.Empty;
		public string? Definition { get; set; }
		public string? Pronunciation { get; set; }
		public string? ImageUrl { get; set; }
		public string? WordType { get; set; }
		public List<string>? Examples { get; set; }
		public string? Notes { get; set; }
		public string? AudioUrl { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime? UpdatedAt { get; set; }
	}
}
