using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.Entities
{
	public class Test
	{
		[Key]
		public int TestId { get; set; }


		[Required]
		[MaxLength(50)]
		public TestType TestType { get; set; } // Mode: Simulator, Practice
		public TestSkill TestSkill { get; set; } = TestSkill.LR; // Skill: L&R, Writing, Speaking, L&R
		public string Title { get; set; }
		public string? Description { get; set; }
		public string? AudioUrl { get; set; }
		[Required]
		public int Duration { get; set; }
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? UpdatedAt { get; set; }
		public CommonStatus Status { get; set; }
		public int Version { get; set; } = 1;  //  Version control
		public int? ParentTestId { get; set; } // Liên kết test gốc (nếu là bản clone)
		public Test? ParentTest { get; set; }
		public int TotalQuestion { get; set; }
		public Guid? CreatedById { get; set; }
		public User? CreatedBy { get; set; }
		public ICollection<TestQuestion> TestQuestions { get; set; } = new List<TestQuestion>();
		public ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
	}
}


