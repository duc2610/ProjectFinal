using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        public int? OptionId { get; set; }
        public Option? Option { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<AIFeedback> AIFeedbacks { get; set; } = new List<AIFeedback>();
    }
}
