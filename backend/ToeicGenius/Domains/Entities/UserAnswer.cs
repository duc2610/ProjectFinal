using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.Entities
{
	public class UserAnswer
	{
		[Key]
		public int UserAnswerId { get; set; }

        [Required]
        public int TestResultId { get; set; }
        public TestResult TestResult { get; set; } = null!;

        [Required]
        public int TestQuestionId { get; set; }
        public TestQuestion TestQuestion { get; set; } = null!;

		[Column(TypeName = "nvarchar(max)")]
		public string? AnswerText { get; set; }
		public string? AnswerAudioUrl { get; set; }

		[Column(TypeName = "nvarchar(5)")]
		public string? ChosenOptionLabel { get; set; }
		public int? SubQuestionIndex { get; set; }

		// Chấm điểm (nếu có)
		public bool? IsCorrect { get; set; }

		public DateTime CreatedAt { get; set; } = Now;
		public DateTime? UpdatedAt { get; set; }

		public virtual ICollection<AIFeedback> AIFeedbacks { get; set; } = new List<AIFeedback>();
	}
}
