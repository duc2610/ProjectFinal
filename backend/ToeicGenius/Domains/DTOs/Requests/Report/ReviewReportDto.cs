using System.ComponentModel.DataAnnotations;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.DTOs.Requests.Report
{
	public class ReviewReportDto
	{
		[Required(ErrorMessage = "Status is required")]
		public ReportStatus Status { get; set; }
		// Valid values: Reviewing, Resolved, Rejected

		[StringLength(1000, ErrorMessage = "ReviewerNotes cannot exceed 1000 characters")]
		public string? ReviewerNotes { get; set; }
	}
}
