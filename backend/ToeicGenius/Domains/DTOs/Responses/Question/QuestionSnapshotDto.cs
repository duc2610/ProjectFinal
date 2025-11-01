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

		// Thêm hai trường để hiển thị kết quả của user
		public string? UserAnswer { get; set; }     // Label của đáp án user chọn, ví dụ: "B"
		public bool? IsCorrect { get; set; }        // True nếu user chọn đúng
	}
	public class OptionSnapshotDto
	{
		public string Label { get; set; } = null!;
		public string Content { get; set; } = null!;
		public bool IsCorrect { get; set; }
	}
}
