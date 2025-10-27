namespace ToeicGenius.Domains.DTOs.Responses.AI
{
    /// <summary>
    /// Response for bulk assessment - Returns all results at once
    /// </summary>
    public class BulkAssessmentResponseDto
    {
        public int TestResultId { get; set; }

        /// <summary>
        /// Writing results (if user did Writing)
        /// </summary>
        public SkillResultDto? WritingResult { get; set; }

        /// <summary>
        /// Speaking results (if user did Speaking)
        /// </summary>
        public SkillResultDto? SpeakingResult { get; set; }

        public DateTime CompletedAt { get; set; }
    }

    public class SkillResultDto
    {
        /// <summary>
        /// Skill name: "Writing" or "Speaking"
        /// </summary>
        public string Skill { get; set; } = string.Empty;

        /// <summary>
        /// Total score for this skill (average of completed parts)
        /// </summary>
        public decimal TotalScore { get; set; }

        /// <summary>
        /// Number of parts completed
        /// </summary>
        public int CompletedParts { get; set; }

        /// <summary>
        /// Total number of parts for this skill (3 for Writing, 5 for Speaking)
        /// </summary>
        public int TotalParts { get; set; }

        /// <summary>
        /// Is this a full skill assessment (all parts completed)?
        /// </summary>
        public bool IsComplete { get; set; }

        /// <summary>
        /// Results for each part
        /// </summary>
        public List<PartResultDto> PartResults { get; set; } = new List<PartResultDto>();
    }

    public class PartResultDto
    {
        /// <summary>
        /// Part number
        /// </summary>
        public int PartNumber { get; set; }

        /// <summary>
        /// Part name
        /// </summary>
        public string PartName { get; set; } = string.Empty;

        /// <summary>
        /// Score for this part (0-100)
        /// </summary>
        public decimal Score { get; set; }

        /// <summary>
        /// FeedbackId for detailed analysis
        /// </summary>
        public int FeedbackId { get; set; }

        /// <summary>
        /// Detailed scores breakdown
        /// </summary>
        public Dictionary<string, object> DetailedScores { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Detailed analysis (grammar errors, vocab issues, etc.)
        /// </summary>
        public Dictionary<string, object> DetailedAnalysis { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// Recommendations for improvement
        /// </summary>
        public List<string> Recommendations { get; set; } = new List<string>();

        /// <summary>
        /// Transcription (for Speaking only)
        /// </summary>
        public string? Transcription { get; set; }

        /// <summary>
        /// Corrected text (for Writing only)
        /// </summary>
        public string? CorrectedText { get; set; }
    }
}
