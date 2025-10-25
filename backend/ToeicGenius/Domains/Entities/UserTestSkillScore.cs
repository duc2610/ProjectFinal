using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class UserTestSkillScore
	{
		[Key]
		public int UserTestResultId { get; set; }

		[Required]
		public int TestResultId { get; set; }
		public TestResult TestResult { get; set; } = null!;

		public string? Skill { get; set; }
		public decimal Score { get; set; }
	}
}


