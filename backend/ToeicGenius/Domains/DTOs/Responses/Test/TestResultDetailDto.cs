using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class TestResultDetailDto
	{
		public int TestResultId { get; set; }
		public int TestId { get; set; }
		public string Title { get; set; } = string.Empty;
		public TestSkill TestSkill { get; set; }
		public TestType TestType { get; set; }
		public string? AudioUrl { get; set; }
		public bool IsSelectTime { get; set; }
        public TestResultStatus Status { get; set; }
        public int Duration { get; set; }
		public int QuantityQuestion { get; set; }
		public int CorrectCount { get; set; }

		// Skill scores
		public int? ListeningScore { get; set; }
		public int? ReadingScore { get; set; }
		public int TotalScore { get; set; }

		public List<TestPartDto> Parts { get; set; } = new();
	}

}
