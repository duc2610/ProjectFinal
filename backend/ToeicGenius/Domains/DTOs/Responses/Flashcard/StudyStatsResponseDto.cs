namespace ToeicGenius.Domains.DTOs.Responses.Flashcard
{
	/// <summary>
	/// Statistics after completing a study session
	/// </summary>
	public class StudyStatsResponseDto
	{
		public int SetId { get; set; }
		public int TotalCardsStudied { get; set; }
		public int CardsKnown { get; set; }
		public int CardsUnknown { get; set; }
		public int NewCardsLearned { get; set; } // Cards that were "new" and became "learning"
		public double AccuracyRate { get; set; } // CardsKnown / TotalCardsStudied * 100
		public TimeSpan StudyDuration { get; set; }
	}
}
