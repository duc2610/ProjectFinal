using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class UpdateTestFromBank
	{
		public string Title { get; set; }
		public TestType TestType { get; set; } = TestType.Practice;
		public TestSkill TestSkill { get; set; }
		public string? Description { get; set; }
		public int Duration { get; set; }
		public List<int>? SingleQuestionIds { get; set; }
		public List<int>? GroupQuestionIds { get; set; }
	}
}
