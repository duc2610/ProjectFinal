namespace ToeicGenius.Domains.DTOs.Responses.Flashcard
{
	/// <summary>
	/// Public flashcard set (for discovery/browse)
	/// </summary>
	public class PublicFlashcardSetDto
	{
		public int SetId { get; set; }
		public string Title { get; set; } = string.Empty;
		public string? Description { get; set; }
		public string Language { get; set; } = string.Empty;
		public int TotalCards { get; set; }
		public Guid UserId { get; set; }
		public string CreatorName { get; set; } = string.Empty; // Username của người tạo
		public DateTime CreatedAt { get; set; }
		public bool IsStudying { get; set; } // User hiện tại có đang học set này không
	}
}
