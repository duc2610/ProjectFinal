using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class TestListResponseDto
	{
		public int Id { get; set; }
		public TestType TestType { get; set; }
		public TestSkill TestSkill { get; set; }
		public string? Title { get; set; }
		public int QuestionQuantity { get; set; }
		public int Duration { get; set; }
		public CommonStatus Status { get; set; }
		public int Version { get; set; }
		public int? ParentTestId { get; set; }
		public DateTime? CreatedAt { get; set; }
	}
}
