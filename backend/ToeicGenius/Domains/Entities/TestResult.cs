using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.Entities
{
	public class TestResult
	{
		[Key]
		public int TestResultId { get; set; }

		[Required]
		public Guid UserId{ get; set; }
		public User User { get; set; } = null!;

		[Required]
		public int TestId { get; set; }
		public Test Test { get; set; } = null!;
		
		public int Duration { get; set; }
		public string? Status { get; set; }
		public decimal TotalScore { get; set; }
		public int TotalQuestions { get; set; }
		public int CorrectCount { get; set; }
		public int IncorrectCount { get; set; }
		public int SkipCount { get; set; }
		public TestType TestType { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }
		public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
		public ICollection<UserTestSkillScore> SkillScores { get; set; } = new List<UserTestSkillScore>();
	}
}


