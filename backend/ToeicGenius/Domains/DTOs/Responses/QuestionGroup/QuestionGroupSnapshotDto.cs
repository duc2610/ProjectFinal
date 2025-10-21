using ToeicGenius.Domains.DTOs.Responses.Question;

namespace ToeicGenius.Domains.DTOs.Responses.QuestionGroup
{
	public class QuestionGroupSnapshotDto
	{
		public int QuestionGroupId { get; set; }
		public int PartId { get; set; }
		public string Passage { get; set; } = null!;
		public string? AudioUrl { get; set; }
		public string? ImageUrl { get; set; }
		public List<QuestionSnapshotDto> QuestionSnapshots { get; set; } = new();
	}
}
