using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class TestDetailDto
	{
		public int TestId { get; set; }
		public string Title { get; set; } = string.Empty;
		public string? Description { get; set; }
		public TestSkill TestSkill { get; set; }
		public TestType TestType { get; set; }
		public string? AudioUrl { get; set; }
		public int Duration { get; set; }
		public CommonStatus Status { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime? UpdatedAt { get; set; }

		public List<TestPartDto> Parts { get; set; } = new();
	}
	public class TestPartDto
	{
		public int PartId { get; set; }
		public string PartName { get; set; }
		public List<QuestionSnapshotDto> Questions { get; set; } = new();
		public List<QuestionGroupSnapshotDto> QuestionGroups { get; set; } = new();
	}
}
