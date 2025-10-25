namespace ToeicGenius.Domains.DTOs.Responses.Question
{
	public class QuestionSnapshotDto
	{
		public int QuestionId { get; set; }
		public int PartId { get; set; }
		public string Content { get; set; } = null!;
		public string? AudioUrl { get; set; }
		public string? ImageUrl { get; set; }
		public string? Explanation { get; set; }
		public List<OptionSnapshotDto> Options { get; set; } = new();
	}
	public class OptionSnapshotDto
	{
		public string Label { get; set; } = null!;
		public string Content { get; set; } = null!;
		public bool IsCorrect { get; set; }
	}
}
