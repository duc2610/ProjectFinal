using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class TestResult
	{
		[Key]
		public int UserTestId { get; set; }

		[Required]
		public Guid UserId{ get; set; }
		public User User { get; set; } = null!;

		[Required]
		public int TestId { get; set; }
		public Test Test { get; set; } = null!;

		public DateTime? StartTime { get; set; }
		public int Duration { get; set; }
		public string? Status { get; set; }
		public decimal TotalScore { get; set; }
		public string? TestMode { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }
		public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
		public ICollection<UserTestSkillScore> SkillScores { get; set; } = new List<UserTestSkillScore>();
	}
}


