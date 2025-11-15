namespace ToeicGenius.Domains.DTOs.Responses.Flashcard
{
	/// <summary>
	/// Response for starting a study session
	/// </summary>
	public class StudySessionResponseDto
	{
		public int SetId { get; set; }
		public string SetTitle { get; set; } = string.Empty;
		public int TotalCards { get; set; }
		public List<StudyCardDto> Cards { get; set; } = new();
	}

	/// <summary>
	/// Card data for study mode (with progress)
	/// </summary>
	public class StudyCardDto
	{
		public int CardId { get; set; }
		public string Term { get; set; } = string.Empty;
		public string? Definition { get; set; }
		public string? Pronunciation { get; set; }
		public string? ImageUrl { get; set; }
		public string? WordType { get; set; }
		public List<string>? Examples { get; set; }
		public string? Notes { get; set; }
		public string? AudioUrl { get; set; }

		// Progress info
		public string Status { get; set; } = "new"; // new, learning, learned
		public int ReviewCount { get; set; }
		public int CorrectCount { get; set; }
		public int IncorrectCount { get; set; }
		public DateTime? LastReviewedAt { get; set; }
		public DateTime? NextReviewAt { get; set; }
	}
}
