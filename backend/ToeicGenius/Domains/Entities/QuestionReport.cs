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

		/// <summary>
		/// ID của câu hỏi con trong group (chỉ dùng khi report câu hỏi trong Question Group)
		/// Null nếu report câu hỏi đơn
		/// </summary>
		public int? SubQuestionId { get; set; }

		/// <summary>
		/// Snapshot của câu hỏi tại thời điểm report (lưu để không bị mất khi Creator edit/xóa)
		/// - Nếu là câu đơn: lưu QuestionSnapshotDto
		/// - Nếu là group: lưu QuestionGroupSnapshotDto
		/// </summary>
		[Column(TypeName = "nvarchar(max)")]
		public string? QuestionSnapshotJson { get; set; }

		/// <summary>
		/// Đánh dấu đây là Question Group hay Single Question (lưu để deserialize đúng type)
		/// </summary>
		public bool IsQuestionGroup { get; set; }

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
