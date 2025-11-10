namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class GeneralLRResultDto
	{
		public int TestResultId { get; set; }
		public int TotalQuestions { get; set; }
		public int CorrectCount { get; set; }
		public int IncorrectCount { get; set; }
		public int SkipCount { get; set; }
		public int Duration { get; set; }
		public int? TotalScore { get; set; }
		public int? ListeningCorrect { get; set; }
		public int? ListeningTotal { get; set; }
		public int? ListeningScore{ get; set; }
		public int? ReadingCorrect { get; set; }
		public int? ReadingTotal { get; set; }
		public int? ReadingScore { get; set; }
	}

}
