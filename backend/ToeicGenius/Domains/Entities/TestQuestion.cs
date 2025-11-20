using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ToeicGenius.Domains.DTOs.Requests.Question;
using ToeicGenius.Domains.Enums;

namespace ToeicGenius.Domains.Entities
{
	public class TestQuestion
	{
		[Key]
		public int TestQuestionId { get; set; }
		[Required]
		public int TestId { get; set; }
		public Test Test { get; set; }
		[Required]
		public int OrderInTest { get; set; }
		public int PartId { get; set; }
		public Part Part { get; set; }
		public QuestionSourceType SourceType { get; set; } // Manual or FromBank
		public bool IsQuestionGroup { get; set; } = false;

		// Link to original Question/QuestionGroup in bank (nullable for manual questions)
		public int? SourceQuestionId { get; set; }
		public int? SourceQuestionGroupId { get; set; }

		// Legacy: Old format - single snapshot (for backward compatibility)
		[Required]
		public string SnapshotJson { get; set; } = string.Empty;

		// New format: Version history - JSON array of all question versions
		// Format: QuestionVersionHistory (contains list of versions)
		[Column(TypeName = "nvarchar(max)")]
		public string? SnapshotVersions { get; set; }

		// Current version number (for quick access, used with SnapshotVersions)
		public int CurrentVersion { get; set; } = 1;

		public CommonStatus Status { get; set; } = CommonStatus.Active;
		public DateTime CreatedAt { get; set; }
		public DateTime? UpdatedAt { get; set; }

	}
}
