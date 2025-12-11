using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.DTOs.Responses.QuestionGroup;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Report
{
	public class QuestionReportDto
	{
		public int ReportId { get; set; }
		public int TestQuestionId { get; set; }

		// Indicates whether this is a question group or single question
		public bool IsQuestionGroup { get; set; }

		/// <summary>
		/// ID câu hỏi con bị report trong group (null nếu là câu hỏi đơn)
		/// </summary>
		public int? SubQuestionId { get; set; }

		// Question info (from SnapshotJson) - for single questions
		public QuestionSnapshotDto? QuestionSnapshot { get; set; }

		// Question Group info (from SnapshotJson) - for question groups (Creator cần xem cả group để sửa)
		public QuestionGroupSnapshotDto? QuestionGroupSnapshot { get; set; }

		/// <summary>
		/// Chi tiết câu hỏi con bị report (trích từ QuestionGroupSnapshot.QuestionSnapshots)
		/// Dùng cho Examinee xem list report của mình - hiển thị giống câu hỏi đơn
		/// </summary>
		public QuestionSnapshotDto? ReportedSubQuestion { get; set; }

		// Thông tin chung của Group (để hiển thị context cho Creator)
		public string? GroupPassage { get; set; }
		public string? GroupAudioUrl { get; set; }
		public string? GroupImageUrl { get; set; }
		public int? GroupQuestionCount { get; set; }

		public string? QuestionContent { get; set; } // Nội dung câu hỏi để hiển thị (Content for single, Content of sub-question for group)
		public int? PartId { get; set; }
		public string? PartName { get; set; }

		// Test info
		public int? TestId { get; set; }
		public string? TestName { get; set; }

		// Source IDs (for editing)
		public int? SourceQuestionId { get; set; }
		public int? SourceQuestionGroupId { get; set; }

		// Reporter info
		public Guid ReportedBy { get; set; }
		public string? ReporterName { get; set; }
		public string? ReporterEmail { get; set; }

		// Report details
		public string ReportType { get; set; } = string.Empty;
		public string? Description { get; set; }
		public ReportStatus Status { get; set; }

		// Review info
		public Guid? ReviewedBy { get; set; }
		public string? ReviewerName { get; set; }
		public string? ReviewerNotes { get; set; }

		// Timestamps
		public DateTime CreatedAt { get; set; }
		public DateTime? ReviewedAt { get; set; }
	}
}
