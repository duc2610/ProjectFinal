using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class StatisticResultDto
	{
		public TestSkill Skill { get; set; } = default!;
		public string Range { get; set; } = default!;
		public int TotalTests { get; set; }
		public int AverageScore { get; set; }
		public int HighestScore { get; set; }
		public double AverageAccuracy { get; set; }
		public double AverageDurationMinutes { get; set; }

		// Chỉ có khi skill = ListeningReading
		public SkillBreakdownDto? Listening { get; set; }
		public SkillBreakdownDto? Reading { get; set; }
	}

	public class SkillBreakdownDto
	{
		public int AverageScore { get; set; }
		public int HighestScore { get; set; }
		public double Accuracy { get; set; }
	}
}
