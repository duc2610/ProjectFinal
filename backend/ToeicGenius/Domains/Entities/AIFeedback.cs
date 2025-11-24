using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static ToeicGenius.Shared.Helpers.DateTimeHelper;

namespace ToeicGenius.Domains.Entities
{
    public class AIFeedback
    {
        [Key]
        public int FeedbackId { get; set; }

        [Required]
        public int UserAnswerId { get; set; }

        [ForeignKey(nameof(UserAnswerId))]
        public UserAnswer UserAnswer { get; set; } = null!;

        [Range(0, 100)]
        public decimal Score { get; set; }
        public string? Content { get; set; }

        [StringLength(50)]
        public string? AIScorer { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? DetailedScoresJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? DetailedAnalysisJson { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? RecommendationsJson { get; set; }

        public string? Transcription { get; set; }
        public string? CorrectedText { get; set; }
        public double? AudioDuration { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string? PythonApiResponse { get; set; }

        public string? AudioFileUrl { get; set; }
        public string? ImageFileUrl { get; set; }

        public DateTime CreatedAt { get; set; } = Now;
        public DateTime? UpdatedAt { get; set; }
    }
}
