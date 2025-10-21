using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.Entities
{
	public class UserTestSkillScore
	{
		[Key]
		public int UserTestResultId { get; set; }

		[Required]
		public int UserTestId { get; set; }
		public TestResult UserTest { get; set; } = null!;

		public string? Skill { get; set; }
		public decimal Score { get; set; }
	}
}


