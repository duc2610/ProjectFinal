using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToeicGenius.Domains.Entities
{
    public class UserAnswer
    {
        [Key]
        public int UserAnswerId { get; set; }

        [Required]
        public int UserTestId { get; set; }
        public TestResult UserTest { get; set; } = null!;

        [Required]
        public int QuestionId { get; set; }
        public Question Question { get; set; } = null!;

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
