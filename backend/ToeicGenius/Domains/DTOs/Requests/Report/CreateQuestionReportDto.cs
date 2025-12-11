using System.ComponentModel.DataAnnotations;

namespace ToeicGenius.Domains.DTOs.Requests.Report
{
	public class CreateQuestionReportDto
	{
		[Required(ErrorMessage = "TestQuestionId is required")]
		public int TestQuestionId { get; set; }

		/// <summary>
		/// ID của câu hỏi con trong group (bắt buộc khi report câu hỏi trong Question Group)
		/// Để null nếu report câu hỏi đơn
		/// </summary>
		public int? SubQuestionId { get; set; }

		[Required(ErrorMessage = "ReportType is required")]
		[StringLength(50)]
		public string ReportType { get; set; } = string.Empty;
		// Valid values: "IncorrectAnswer", "Typo", "AudioIssue", "ImageIssue", "Unclear", "Other"

		[StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
		public string? Description { get; set; }
	}
}
