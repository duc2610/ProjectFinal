using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class TestHistoryDto
	{
		public int TestId { get; set; }

		public int TestResultId { get; set; }

		public string TestStatus { get; set; } 

        public TestType TestType { get; set; } // Mode: Simulator, Practice
		public TestSkill TestSkill { get; set; } = TestSkill.LR; // Skill: L&R, Writing, Speaking, L&R
		public string Title { get; set; }
		public int Duration { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public int TotalQuestion { get; set; }
		public int CorrectQuestion { get; set; }
	}
}
