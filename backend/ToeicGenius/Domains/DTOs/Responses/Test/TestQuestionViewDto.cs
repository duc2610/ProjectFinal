using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;

namespace ToeicGenius.Domains.DTOs.Responses.Test
{
	public class TestQuestionViewDto
	{
		public int TestQuestionId { get; set; }
		public bool IsGroup { get; set; }
		public QuestionSnapshotDto? QuestionSnapshotDto { get; set; }
		public QuestionGroupSnapshotDto? QuestionGroupSnapshotDto { get; set; }
	}
}
