namespace ToeicGenius.Domains.DTOs.Responses.Flashcard
{
	public class FlashcardSetResponseDto
	{
		public int SetId { get; set; }
		public string Title { get; set; } = string.Empty;
		public string? Description { get; set; }
		public string Language { get; set; } = "en-US";
		public bool IsPublic { get; set; }
		public Guid UserId { get; set; }
		public int TotalCards { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime? UpdatedAt { get; set; }
	}
}
