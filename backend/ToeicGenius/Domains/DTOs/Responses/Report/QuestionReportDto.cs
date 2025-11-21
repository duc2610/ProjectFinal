using ToeicGenius.Domains.DTOs.Responses.Question;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Responses.Report
{
	public class QuestionReportDto
	{
		public int ReportId { get; set; }
		public int TestQuestionId { get; set; }

		// Question info (from SnapshotJson)
		public QuestionSnapshotDto? QuestionSnapshot { get; set; }
		public int? PartId { get; set; }
		public string? PartName { get; set; }

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
