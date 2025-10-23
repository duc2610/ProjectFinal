using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Test
{
	public class SubmitLRTestRequestDto
	{
		public Guid UserId { get; set; } = default!;
		public int TestId { get; set; }
		public int Duration { get; set; }
		public TestType TestType { get; set; }
		public List<UserLRAnswerDto> Answers { get; set; } = new();
	}
	public class UserLRAnswerDto
	{
		public int TestQuestionId { get; set; }       // ID của TestQuestion thực tế
		public int? SubQuestionIndex { get; set; }    // Nếu là câu trong group
		public string ChosenOptionLabel { get; set; } = default!;
	}
}
