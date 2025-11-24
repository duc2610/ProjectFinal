using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ToeicGenius.Domains.Enums;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.Entities
{
	public class QuestionReport
	{
		[Key]
		public int ReportId { get; set; }

		// Câu hỏi bị report
		[Required]
		public int TestQuestionId { get; set; }
		public TestQuestion TestQuestion { get; set; } = null!;

		// Người report
		[Required]
		public Guid ReportedBy { get; set; }

		[ForeignKey("ReportedBy")]
		public User Reporter { get; set; } = null!;

		// Loại lỗi
		[Required]
		[Column(TypeName = "nvarchar(50)")]
		public string ReportType { get; set; } = string.Empty; // "IncorrectAnswer", "Typo", "AudioIssue", "ImageIssue", "Unclear", "Other"

		// Mô tả chi tiết
		[Column(TypeName = "nvarchar(1000)")]
		public string? Description { get; set; }

		// Trạng thái xử lý
		public ReportStatus Status { get; set; } = ReportStatus.Pending;

		// Người xử lý (Admin/Test Creator)
		public Guid? ReviewedBy { get; set; }

		[ForeignKey("ReviewedBy")]
		public User? Reviewer { get; set; }

		// Ghi chú của reviewer
		[Column(TypeName = "nvarchar(1000)")]
		public string? ReviewerNotes { get; set; }

		// Timestamps
		public DateTime CreatedAt { get; set; } = Now;
		public DateTime? ReviewedAt { get; set; }
	}
}
