namespace ToeicGenius.Domains.DTOs.Requests.Flashcard
{
	/// <summary>
	/// DTO for marking flashcard as known/unknown during study session
	/// </summary>
	public class MarkCardKnowledgeDto
	{
		public int CardId { get; set; }
		public bool IsKnown { get; set; } // true = biết, false = không biết
	}
}
