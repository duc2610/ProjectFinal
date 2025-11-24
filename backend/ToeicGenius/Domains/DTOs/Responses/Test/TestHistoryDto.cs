using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class TestHistoryDto
	{
		public int TestId { get; set; }

		public int TestResultId { get; set; }

		public string TestStatus { get; set; } 

		public bool IsSelectTime { get; set; }
        public TestType TestType { get; set; } // Mode: Simulator, Practice
		public TestSkill TestSkill { get; set; } = TestSkill.LR; // Skill: L&R, Writing, Speaking, L&R
		public string Title { get; set; }
		public int Duration { get; set; }
		public DateTime CreatedAt { get; set; } = Now;
		public int TotalQuestion { get; set; }
		public int TotalScore { get; set; }
		public int CorrectQuestion { get; set; }
	}
}
