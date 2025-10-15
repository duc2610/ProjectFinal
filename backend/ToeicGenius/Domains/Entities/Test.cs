using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.Entities
{
	public class Test
	{
		[Key]
		public int TestId { get; set; }

		public string? TestMode { get; set; }
		public TestSkill TestSkill { get; set; } = TestSkill.LR;
		public string? Title { get; set; }
		public string? Description { get; set; }
		public int Duration { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }
		public CommonStatus Status { get; set; }
		public ICollection<Part> Parts { get; set; } = new List<Part>();
		public ICollection<UserTest> UserTests { get; set; } = new List<UserTest>();
	}
}


