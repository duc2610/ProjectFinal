using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class TestStartResponseDto
	{
        // Created TestResultId for this user's session (server-side)
        public int TestResultId { get; set; }
		public int TestId { get; set; }
		public string Title { get; set; } = string.Empty;
		public TestSkill TestSkill { get; set; }
		public TestType TestType { get; set; }
		public string? AudioUrl { get; set; }
		public int Duration { get; set; }
		public int QuantityQuestion { get; set; }
		public List<TestPartDto> Parts { get; set; } = new();
		public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
